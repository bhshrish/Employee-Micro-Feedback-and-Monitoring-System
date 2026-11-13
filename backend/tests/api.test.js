import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { createHmac } from "node:crypto";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app";
import { PulseResponse } from "../src/models/PulseResponse";
import { PulseReceipt } from "../src/models/PulseReceipt";
import { Team } from "../src/models/Team";
import { User } from "../src/models/User";
import { TeamActivity } from "../src/models/TeamActivity";
import { Invoice } from "../src/models/Invoice";
import { GeneratedReport } from "../src/models/GeneratedReport";
import { Alert } from "../src/models/Alert";
import { processRazorpayEvent } from "../src/services/billing.service";
import { expireTrials } from "../src/jobs/subscriptions";
import { weekStart } from "../src/utils/week";
import { Organization } from "../src/models/Organization";
import { Attendance } from "../src/models/Attendance";
import { OtpChallenge } from "../src/models/OtpChallenge";
import { PasswordResetToken } from "../src/models/PasswordResetToken";
import { OperationsAdmin } from "../src/models/OperationsAdmin";
import { EmployeeTool } from "../src/models/EmployeeTool";
import { migrateLegacyData } from "../src/legacy-migration";
import { signin as createTestSession } from "../src/services/auth.service";
import { hashCode } from "../src/services/otp.service";
const app = createApp();
let mongo;
function signup(email, name = "Test User") {
    return request(app).post("/api/v1/auth/signup").send({
        name,
        email,
        password: "correct-horse-battery",
    });
}
async function signupAndSignin(email, name = "Test User") {
    await signup(email, name).expect(201);
    const session = await createTestSession({ email, password: "correct-horse-battery" });
    return {
        body: { user: session.user, accessToken: session.accessToken },
        headers: { "set-cookie": [`calmwork_refresh=${session.refreshToken}`] },
    };
}
function accessCookie(response) {
    const value = response.headers["set-cookie"]?.find((cookie) => cookie.startsWith("calmwork_refresh="));
    if (!value)
        throw new Error("refresh cookie missing");
    return value.split(";")[0];
}
function createOtpChallenge(destination, purpose, code = "123456", options = {}) {
    const now = new Date();
    return OtpChallenge.create({
        destination,
        channel: "email",
        purpose,
        codeHash: hashCode(destination, purpose, code, "email"),
        attempts: 0,
        resendAfter: options.resendAfter ?? new Date(now.getTime() + 60_000),
        expiresAt: options.expiresAt ?? new Date(now.getTime() + 5 * 60_000),
        consumedAt: null,
        payload: options.payload ?? {},
    });
}
beforeAll(async () => {
    mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 30_000 } });
    await mongoose.connect(mongo.getUri());
});
beforeEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})));
});
afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
});
describe("PULSE API", () => {
    it("serves liveness, readiness, and API docs without authentication", async () => {
        await request(app).get("/health").expect(200).expect({ status: "ok" });
        await request(app).get("/health/live").expect(200);
        await request(app).get("/health/ready").expect(200);
        await request(app).get("/api/v1/health/live").expect(200).expect({ status: "ok" });
        await request(app).get("/api/v1/health/ready").expect(200);
        await request(app).get("/api/docs").expect(200).expect(/\/api\/v1/);
        await request(app).get("/api/openapi.yaml").expect(200).expect(/openapi: 3.0.3/);
    });
    it("creates an owner trial and rejects unknown request properties", async () => {
        const invalid = await request(app).post("/api/v1/auth/signup").send({
            name: "Test User",
            email: "one@example.test",
            password: "correct-horse-battery",
            isAdmin: true,
        }).expect(400);
        assert.equal(invalid.body.error.requestId, invalid.headers["x-request-id"]);
        const email = "One@Example.test";
        const response = await signup(email).expect(201);
        assert.equal(response.body.user.role, "admin");
        assert.equal(response.body.user.subscription.status, "trialing");
        assert.equal(response.body.user.email, email);
        assert.equal(response.body.user.passwordHash, undefined);
        assert.equal(response.body.accessToken, undefined);
        assert.equal(response.body.refreshToken, undefined);
        assert.equal(response.headers["set-cookie"], undefined);
        const storedUser = await User.findOne({ email }).select("+passwordHash");
        assert.ok(storedUser);
        assert.equal(storedUser.email, email);
        assert.notEqual(storedUser.passwordHash, "correct-horse-battery");
        assert.equal(await bcrypt.compare("correct-horse-battery", storedUser.passwordHash), true);
        await request(app).post("/api/v1/auth/signin").send({
            email: email.toLowerCase(),
            password: "correct-horse-battery",
        }).expect(401);
        await request(app).post("/api/v1/auth/signin").send({
            email,
            password: "CORRECT-HORSE-BATTERY",
        }).expect(401);
        const keys = ["NODE_ENV", "MONGODB_URI", "FRONTEND_URL", "CORS_ORIGINS", "COOKIE_SECURE"];
        const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
        Object.assign(process.env, {
            NODE_ENV: "production",
            MONGODB_URI: "mongodb://mongo.example.test/pulse",
            FRONTEND_URL: "https://app.example.test",
            CORS_ORIGINS: "https://app.example.test",
            COOKIE_SECURE: "true",
        });
        let signin;
        try {
            signin = await request(app).post("/api/v1/auth/signin").send({
                email,
                password: "correct-horse-battery",
            }).expect(200);
        }
        finally {
            for (const [key, value] of Object.entries(previous)) {
                if (value === undefined)
                    delete process.env[key];
                else
                    process.env[key] = value;
            }
        }
        assert.ok(signin.body.accessToken);
        const cookie = signin.headers["set-cookie"]?.find((value) => value.startsWith("calmwork_refresh="));
        assert.ok(cookie);
        assert.match(cookie, /;\s*secure/i);
        assert.match(cookie, /;\s*samesite=none/i);
    });
    it("allows password sign-in and completes a single-use email password reset", async () => {
        const email = "password-reset@example.test";
        await signup(email).expect(201);
        await request(app).post("/api/v1/auth/signin")
            .send({ email, password: "correct-horse-battery" }).expect(200);

        const forgot = await request(app).post("/api/v1/auth/forgot-password")
            .send({ email: email.toUpperCase() }).expect(200);
        assert.match(forgot.body.message, /If an account exists/);
        assert.equal(await PasswordResetToken.countDocuments(), 1);

        const rawToken = "valid-reset-token-".padEnd(64, "x");
        const tokenHash = createHmac("sha256", process.env.JWT_REFRESH_SECRET).update(rawToken).digest("hex");
        const user = await User.findOne({ email });
        assert.ok(user);
        await PasswordResetToken.create({
            userId: user._id,
            tokenHash,
            expiresAt: new Date(Date.now() + 60_000),
        });
        await request(app).post("/api/v1/auth/reset-password")
            .send({ token: rawToken, password: "new-correct-password" }).expect(200);
        await request(app).post("/api/v1/auth/reset-password")
            .send({ token: rawToken, password: "another-new-password" }).expect(401);
        await request(app).post("/api/v1/auth/signin")
            .send({ email, password: "correct-horse-battery" }).expect(401);
        await request(app).post("/api/v1/auth/signin")
            .send({ email, password: "new-correct-password" }).expect(200);
    });
    it("authenticates only the configured platform administrator and supports password reset", async () => {
        const adminEmail = process.env.OPS_ADMIN_EMAIL;
        const initialPassword = process.env.OPS_ADMIN_INITIAL_PASSWORD;
        await request(app).post("/api/v1/auth/signin")
            .send({ email: adminEmail, password: initialPassword }).expect(401);
        await request(app).post("/api/v1/operations/auth/login")
            .send({ email: "other@example.test", password: initialPassword }).expect(401);
        const login = await request(app).post("/api/v1/operations/auth/login")
            .send({ email: adminEmail, password: initialPassword }).expect(200);
        const cookie = login.headers["set-cookie"].find((value) => value.startsWith("calmwork_operations=")).split(";")[0];
        assert.equal(login.body.admin.email, adminEmail);
        await request(app).get("/api/v1/operations/auth/me").set("Cookie", cookie).expect(200);

        await request(app).post("/api/v1/auth/forgot-password")
            .send({ email: adminEmail }).expect(200);
        assert.equal(await PasswordResetToken.countDocuments({ adminEmail }), 1);
        const resetToken = "valid-admin-reset-token".padEnd(64, "x");
        const tokenHash = createHmac("sha256", process.env.JWT_REFRESH_SECRET).update(resetToken).digest("hex");
        await PasswordResetToken.create({
            adminEmail,
            tokenHash,
            expiresAt: new Date(Date.now() + 60_000),
        });
        await request(app).post("/api/v1/auth/reset-password")
            .send({ token: resetToken, password: "changed-admin-password" }).expect(200);
        await request(app).get("/api/v1/operations/auth/me").set("Cookie", cookie).expect(401);
        await request(app).post("/api/v1/operations/auth/login")
            .send({ email: adminEmail, password: initialPassword }).expect(401);
        const updatedLogin = await request(app).post("/api/v1/operations/auth/login")
            .send({ email: adminEmail, password: "changed-admin-password" }).expect(200);
        assert.ok(updatedLogin.headers["set-cookie"].some((value) => value.startsWith("calmwork_operations=")));
        assert.equal(await OperationsAdmin.countDocuments(), 1);
    });
    it("migrates legacy account and team workspace fields without removing legacy fields", async () => {
        const organizationId = new mongoose.Types.ObjectId();
        const teamId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        const trialEndsAt = new Date(Date.now() + 7 * 86_400_000);
        await Organization.collection.insertOne({
            _id: organizationId,
            name: "Legacy workspace",
            ownerId: userId,
            plan: "Team",
        });
        await Team.collection.insertOne({
            _id: teamId,
            orgId: organizationId,
            name: "General",
        });
        await User.collection.insertOne({
            _id: userId,
            orgId: organizationId,
            teamId,
            name: "Legacy User",
            email: "legacy@example.test",
            passwordHash: await bcrypt.hash("correct-horse-battery", 4),
            role: "admin",
            settings: { idleThresholdMin: 8 },
        });
        await mongoose.connection.collection("subscriptions").insertOne({
            orgId: organizationId,
            status: "trialing",
            trialEndsAt,
        });
        assert.deepEqual(await migrateLegacyData(), { users: 1, teams: 1 });
        const migratedUser = await User.findById(userId);
        const migratedTeam = await Team.findById(teamId);
        assert.equal(migratedUser?.organizationId.toString(), organizationId.toString());
        assert.equal(migratedUser?.subscription.plan, "Team");
        assert.equal(migratedUser?.subscription.trialEndsAt.getTime(), trialEndsAt.getTime());
        assert.equal(migratedUser?.settings.idleThresholdMinutes, 8);
        assert.equal(migratedTeam?.organizationId.toString(), organizationId.toString());
        const legacyUser = await User.collection.findOne({ _id: userId });
        const legacyTeam = await Team.collection.findOne({ _id: teamId });
        assert.equal(legacyUser?.orgId?.toString(), organizationId.toString());
        assert.equal(legacyTeam?.orgId?.toString(), organizationId.toString());
        const signin = await request(app).post("/api/v1/auth/signin").send({
            email: "legacy@example.test",
            password: "correct-horse-battery",
        }).expect(200);
        assert.equal(signin.body.user.organizationId, organizationId.toString());
        assert.equal(signin.body.user.subscription.plan, "Team");
    });
    it("rejects prototype-pollution keys before validation", async () => {
        await request(app)
            .post("/api/v1/auth/signup")
            .set("Content-Type", "application/json")
            .send('{"name":"Test User","email":"proto@example.test","password":"correct-horse-battery","__proto__":{"role":"owner"}}')
            .expect(400);
    });
    it("rotates refresh tokens and revokes the whole token family on reuse", async () => {
        const first = await signupAndSignin("rotate@example.test");
        const oldCookie = accessCookie(first);
        const rotated = await request(app).post("/api/v1/auth/refresh").set("Cookie", oldCookie).expect(200);
        const newCookie = accessCookie(rotated);
        await request(app).post("/api/v1/auth/refresh").set("Cookie", oldCookie).expect(401);
        await request(app).post("/api/v1/auth/refresh").set("Cookie", newCookie).expect(401);
    });
    it("supports the explicit login and users paths", async () => {
        await signupAndSignin("login@example.test");
        const login = await request(app).post("/api/v1/auth/login").send({
            email: "login@example.test",
            password: "correct-horse-battery",
        }).expect(200);
        const users = await request(app)
            .get("/api/v1/users")
            .set("Authorization", `Bearer ${login.body.accessToken}`)
            .expect(200);
        assert.equal(users.body.members.length, 1);
        const plans = await request(app).get("/api/v1/billing/plans").expect(200);
        assert.equal(plans.body.plans.length, 3);
        const currentSubscription = await request(app)
            .get("/api/v1/billing/subscription")
            .set("Authorization", `Bearer ${login.body.accessToken}`)
            .expect(200);
        assert.equal(currentSubscription.body.subscription.status, "trialing");
    });
    it("enforces OTP expiry, resend cooldown, five-attempt limit, and cookie-only sessions", async () => {
        const account = await signupAndSignin("otp-limit@example.test");
        const destination = account.body.user.email;
        await createOtpChallenge(destination, "signin");
        await request(app).post("/api/v1/auth/otp/request")
            .send({ email: destination, purpose: "signin" }).expect(429);
        for (let attempt = 0; attempt < 5; attempt += 1) {
            await request(app).post("/api/v1/auth/otp/verify")
                .send({ email: destination, purpose: "signin", code: "000000" }).expect(401);
        }
        assert.equal((await OtpChallenge.findOne({ destination, purpose: "signin" })).attempts, 5);
        await request(app).post("/api/v1/auth/otp/verify")
            .send({ email: destination, purpose: "signin", code: "123456" }).expect(401);

        const expiredDestination = "otp-expired@example.test";
        await createOtpChallenge(expiredDestination, "signin", "123456", { expiresAt: new Date(Date.now() - 1000) });
        await request(app).post("/api/v1/auth/otp/verify")
            .send({ email: expiredDestination, purpose: "signin", code: "123456" }).expect(401);
    });
    it("establishes OTP sessions only in HTTP-only cookies and isolates admin JWTs", async () => {
        const account = await signupAndSignin("otp-session@example.test");
        await createOtpChallenge(account.body.user.email, "signin");
        const session = await request(app).post("/api/v1/auth/otp/verify")
            .send({ email: account.body.user.email, purpose: "signin", code: "123456" }).expect(200);
        assert.equal(session.body.accessToken, undefined);
        assert.ok(session.headers["set-cookie"].some((cookie) => /calmwork_access=.*HttpOnly/i.test(cookie)));
        assert.ok(session.headers["set-cookie"].some((cookie) => /calmwork_refresh=.*HttpOnly/i.test(cookie)));

        await createOtpChallenge("admin@gmail.com", "admin");
        const admin = await request(app).post("/api/v1/operations/auth/otp/verify")
            .send({ email: "admin@gmail.com", code: "123456" }).expect(200);
        const cookie = admin.headers["set-cookie"].find((value) => value.startsWith("calmwork_operations="));
        assert.ok(cookie);
        const token = cookie.split(";")[0].slice("calmwork_operations=".length);
        assert.equal(jwt.verify(token, process.env.JWT_ADMIN_SECRET).typ, "operations_admin");
        assert.throws(() => jwt.verify(token, process.env.JWT_ACCESS_SECRET));
    });
    it("keeps planner tasks tenant- and user-scoped and does not persist salary estimates", async () => {
        const firstOwner = await signupAndSignin("tools-first@example.test");
        const secondOwner = await signupAndSignin("tools-second@example.test");
        const firstAuth = { Authorization: `Bearer ${firstOwner.body.accessToken}` };
        const secondAuth = { Authorization: `Bearer ${secondOwner.body.accessToken}` };
        const dueAt = new Date(Date.now() + 86_400_000).toISOString();
        const created = await request(app).post("/api/v1/tools/planner").set(firstAuth)
            .send({ title: "Focus time", estimatedMinutes: 45, dueAt }).expect(201);
        assert.equal(new Date(created.body.task.startsAt).toISOString(), dueAt);
        const updatedDueAt = new Date(Date.now() + 172_800_000).toISOString();
        const updated = await request(app).patch(`/api/v1/tools/planner/${created.body.task._id}`).set(firstAuth)
            .send({ dueAt: updatedDueAt }).expect(200);
        assert.equal(new Date(updated.body.task.startsAt).toISOString(), updatedDueAt);
        const otherTasks = await request(app).get("/api/v1/tools/planner").set(secondAuth).expect(200);
        assert.equal(otherTasks.body.tasks.length, 0);

        await request(app).post("/api/v1/tools/salary/check").set(firstAuth)
            .send({ grossMonthly: 5000 }).expect(403);
        const employee = await User.create({
            organizationId: firstOwner.body.user.organizationId,
            teamId: firstOwner.body.user.teamId,
            name: "Salary Private",
            email: "salary-private@example.test",
            passwordHash: await bcrypt.hash("correct-horse-battery", 12),
            role: "employee",
            subscription: { plan: "Team", status: "trialing", trialEndsAt: new Date(Date.now() + 86_400_000) },
        });
        const employeeSession = await createTestSession({ email: employee.email, password: "correct-horse-battery" });
        const salary = await request(app).post("/api/v1/tools/salary/check")
            .set({ Authorization: `Bearer ${employeeSession.accessToken}` })
            .send({ grossMonthly: 5000, deductionsMonthly: 500, estimatedTaxRate: 10 }).expect(200);
        assert.equal(salary.body.estimate.estimatedTakeHomeMonthly, 4000);
        assert.equal(await EmployeeTool.countDocuments({ organizationId: employee.organizationId, kind: "salary" }), 0);
    });
    it("supports the requested collection, analytics, billing, webhook, and report paths", async () => {
        const account = await signupAndSignin("contract-aliases@example.test");
        const auth = { Authorization: `Bearer ${account.body.accessToken}` };
        await request(app).get("/api/v1/sessions?page=1&limit=10").set(auth).expect(200);
        await request(app).post("/api/v1/pulses").set(auth)
            .send({ mood: 4, stress: 3, workload: 3 }).expect(201);
        await request(app).get("/api/v1/pulses/status").set(auth).expect(200)
            .expect((res) => assert.equal(res.body.submittedThisWeek, true));
        const user = await User.findById(account.body.user.id).lean();
        assert.ok(user?.teamId);
        await Organization.updateOne({ _id: user.organizationId }, { $set: { minGroupSize: 7 } });
        const teams = await request(app).get("/api/v1/analytics/teams").set(auth).expect(200);
        assert.equal(teams.body.minimumGroupSize, 7);
        assert.equal(teams.body.teams[0].suppressed, true);
        const trend = await request(app).get(`/api/v1/analytics/teams/${user.teamId}/trend?weeks=6`)
            .set(auth).expect(200);
        assert.equal(trend.body.trend.suppressed, true);
        await request(app).post("/api/v1/users/invite").set(auth)
            .send({ email: "new-contract-user@example.test", teamId: String(user.teamId) }).expect(201);
        const otherMember = await User.create({
            organizationId: user.organizationId,
            teamId: user.teamId,
            name: "Role Target",
            email: "role-target@example.test",
            passwordHash: "not-used",
            role: "employee",
            subscription: { plan: "Team", status: "trialing", trialEndsAt: new Date(Date.now() + 86_400_000) },
        });
        await request(app).patch(`/api/v1/users/${otherMember.id}/role`).set(auth)
            .send({ role: "manager" }).expect(200)
            .expect((res) => assert.equal(res.body.member.role, "manager"));
        await request(app).post("/api/v1/billing/checkout-session").set(auth)
            .send({ plan: "Team", cycle: "monthly" }).expect(503);
        await request(app).post("/api/v1/webhooks/razorpay")
            .set("Content-Type", "application/json").set("X-Razorpay-Signature", "invalid")
            .send("{}").expect(403);
        await request(app).post("/api/v1/reports/preview").set(auth)
            .send({ period: "30d", metrics: ["Active time"], format: "pdf" }).expect(200);
    });
    it("supports tenant-scoped member invitations and assigns the invitee to the selected team", async () => {
        const owner = await signupAndSignin("owner-invite@example.test");
        const otherTeam = await request(app)
            .post("/api/v1/workspace/teams")
            .set("Authorization", `Bearer ${owner.body.accessToken}`)
            .send({ name: "Other Team" })
            .expect(201);
        const invitationResponse = await request(app)
            .post("/api/v1/workspace/invitations")
            .set("Authorization", `Bearer ${owner.body.accessToken}`)
            .send({ email: "new-member@example.test", teamId: owner.body.user.teamId })
            .expect(201);
        const invitation = invitationResponse.body.invitation;
        assert.ok(invitation.token);
        const member = await request(app)
            .post("/api/v1/auth/accept-invitation")
            .send({
            token: invitation.token,
            email: invitation.email,
            name: "New Member",
            password: "correct-horse-battery",
        })
            .expect(201);
        assert.equal(member.body.user.organizationId, owner.body.user.organizationId);
        assert.equal(member.body.user.teamId, owner.body.user.teamId);
        assert.equal(member.body.user.role, "employee");
        assert.equal(member.body.accessToken, undefined);
        assert.equal(member.headers["set-cookie"], undefined);
        const checkoutEvent = {
            event: "subscription.activated",
            payload: { subscription: { entity: {
                id: "sub_workspace",
                status: "active",
                current_end: Math.floor(Date.now() / 1000) + 86_400,
                notes: {
                    userId: owner.body.user.id,
                    organizationId: owner.body.user.organizationId,
                    plan: "Business",
                },
            } } },
        };
        await processRazorpayEvent(checkoutEvent, "evt_workspace_subscription");
        const updatedMember = await User.findById(member.body.user.id);
        assert.equal(updatedMember?.subscription.plan, "Business");
        assert.equal(updatedMember?.subscription.status, "active");
        await request(app)
            .patch(`/api/v1/workspace/members/${member.body.user.id}`)
            .set("Authorization", `Bearer ${owner.body.accessToken}`)
            .send({ role: "manager" })
            .expect(200);
        member.body.accessToken = (await createTestSession({
            email: "new-member@example.test",
            password: "correct-horse-battery",
        })).accessToken;
        await request(app)
            .get("/api/v1/workspace/members")
            .set("Authorization", `Bearer ${member.body.accessToken}`)
            .expect(200)
            .set("Authorization", `Bearer ${owner.body.accessToken}`)
            .expect((res) => assert.equal(res.body.members.length, 2));
        await request(app)
            .post("/api/v1/workspace/invitations")
            .set("Authorization", `Bearer ${member.body.accessToken}`)
            .send({ email: "wrong-team@example.test", teamId: otherTeam.body.team._id })
            .expect(403);
        await request(app)
            .get("/api/v1/billing/invoices")
            .set("Authorization", `Bearer ${member.body.accessToken}`)
            .expect(403);
        await request(app)
            .get("/api/v1/pulse/teams")
            .set("Authorization", `Bearer ${member.body.accessToken}`)
            .expect(200)
            .expect((res) => assert.equal(res.body.teams.length, 0));
        await request(app)
            .post("/api/v1/auth/accept-invitation")
            .send({
            token: invitation.token,
            email: invitation.email,
            name: "New Member",
            password: "correct-horse-battery",
        })
            .expect(401);
    });
    it("stores pulse ratings without user identity or free-text comments and hides small groups", async () => {
        const account = await signupAndSignin("pulse@example.test");
        const result = await request(app)
            .post("/api/v1/pulse")
            .set("Authorization", `Bearer ${account.body.accessToken}`)
            .send({ mood: 4, stress: 2, workload: 3, comment: "private and intentionally discarded" })
            .expect(201);
        assert.equal(result.body.submitted, true);
        const response = await PulseResponse.findOne().lean();
        assert.ok(response);
        assert.equal(typeof response._id, "string");
        assert.equal(mongoose.isValidObjectId(response._id), false);
        assert.equal(Object.hasOwn(response, "userId"), false);
        assert.equal(Object.hasOwn(response, "comment"), false);
        assert.equal(Object.hasOwn(response, "createdAt"), false);
        const receipt = await PulseReceipt.findOne().lean();
        assert.ok(receipt);
        assert.equal(Object.hasOwn(receipt, "mood"), false);
        await request(app)
            .get("/api/v1/pulse/teams")
            .set("Authorization", `Bearer ${account.body.accessToken}`)
            .expect(200)
            .expect((res) => assert.deepEqual(res.body.teams, []));
        await request(app)
            .post("/api/v1/pulse")
            .set("Authorization", `Bearer ${account.body.accessToken}`)
            .send({ mood: 4, stress: 2, workload: 3 })
            .expect(409);
    });
    it("returns team aggregates only after at least five responses", async () => {
        const account = await signupAndSignin("manager@example.test");
        const teamId = account.body.user.teamId;
        const organizationId = account.body.user.organizationId;
        const team = await Team.findById(teamId);
        assert.ok(team);
        await PulseResponse.insertMany(Array.from({ length: 4 }, () => ({
            organizationId,
            teamId,
            weekStart: weekStart(),
            mood: 3,
            stress: 4,
            workload: 4,
        })));
        const url = "/api/v1/pulse/teams";
        await request(app).get(url).set("Authorization", `Bearer ${account.body.accessToken}`).expect(200)
            .expect((res) => assert.equal(res.body.teams.length, 0));
        await PulseResponse.create({ organizationId, teamId, weekStart: weekStart(), mood: 3, stress: 4, workload: 4 });
        await request(app).get(url).set("Authorization", `Bearer ${account.body.accessToken}`).expect(200)
            .expect((res) => {
            assert.equal(res.body.teams.length, 1);
            assert.equal(res.body.teams[0].responses, 5);
            assert.equal(Object.hasOwn(res.body.teams[0], "comments"), false);
            assert.equal(Object.hasOwn(res.body.teams[0], "userIds"), false);
        });
    });
    it("prevents cross-user access to personal activity sessions and blocks expired trial access", async () => {
        const first = await signupAndSignin("first@example.test");
        const second = await signupAndSignin("second@example.test");
        const started = await request(app)
            .post("/api/v1/sessions")
            .set("Authorization", `Bearer ${first.body.accessToken}`)
            .send({ task: "Planning", category: "Productive" })
            .expect(201);
        await request(app)
            .post(`/api/v1/sessions/${started.body.session._id}/stop`)
            .set("Authorization", `Bearer ${second.body.accessToken}`)
            .send({})
            .expect(404);
        await request(app)
            .post(`/api/v1/sessions/${started.body.session._id}/stop`)
            .set("Authorization", `Bearer ${first.body.accessToken}`)
            .send({})
            .expect(200);
        await request(app)
            .get("/api/v1/reports/summary")
            .set("Authorization", `Bearer ${first.body.accessToken}`)
            .expect(200);
        await User.updateOne({ _id: first.body.user.id }, { $set: { "subscription.status": "trial_expired" } });
        await request(app)
            .get("/api/v1/reports/summary")
            .set("Authorization", "Bearer " + first.body.accessToken)
            .expect(402)
            .expect((res) => assert.equal(res.body.error.code, "SUBSCRIPTION_REQUIRED"));
        await request(app).get("/api/v1/dashboard").set("Authorization", `Bearer ${first.body.accessToken}`).expect(403);
    });
    it("supports pausing and resuming a personal activity session", async () => {
        const account = await signupAndSignin("timer@example.test");
        const headers = { Authorization: `Bearer ${account.body.accessToken}` };
        const started = await request(app)
            .post("/api/v1/sessions")
            .set(headers)
            .send({ task: "Planning", category: "Productive" })
            .expect(201);
        const sessionId = started.body.session._id;
        await request(app).post(`/api/v1/sessions/${sessionId}/pause`).set(headers).expect(200)
            .expect((res) => assert.equal(res.body.session.status, "paused"));
        await request(app).post(`/api/v1/sessions/${sessionId}/resume`).set(headers).expect(200)
            .expect((res) => assert.equal(res.body.session.status, "running"));
        await request(app).post(`/api/v1/sessions/${sessionId}/stop`).set(headers).send({ activeSeconds: 30 }).expect(400);
        await request(app).post(`/api/v1/sessions/${sessionId}/stop`).set(headers).send({}).expect(200)
            .expect((res) => assert.equal(res.body.session.status, "stopped"));
    });
    it("returns live activity totals and persists profile settings", async () => {
        const account = await signupAndSignin("live-dashboard@example.test");
        const auth = { Authorization: "Bearer " + account.body.accessToken };
        const started = await request(app).post("/api/v1/sessions/start").set(auth)
            .send({ task: "Planning", category: "Productive" }).expect(201);
        await TeamActivity.updateOne({ _id: started.body.session._id }, { $set: { startedAt: new Date(Date.now() - 120_000) } });
        const dashboard = await request(app).get("/api/v1/dashboard?range=today").set(auth).expect(200);
        assert.ok(dashboard.body.summary.activeSeconds >= 120);
        assert.ok(dashboard.body.daily[0].productive >= 120);
        const profile = await request(app).patch("/api/v1/auth/me").set(auth).send({
            name: "Signed In Name",
            settings: { idleThresholdMinutes: 9, notifications: { weeklyPulse: false } },
        }).expect(200);
        assert.equal(profile.body.user.name, "Signed In Name");
        assert.equal(profile.body.user.settings.idleThresholdMinutes, 9);
        assert.equal(profile.body.user.settings.notifications.weeklyPulse, false);
    });
    it("supports session start, heartbeat, idle, tags, history and summary paths", async () => {
        const account = await signupAndSignin("session-paths@example.test");
        const auth = { Authorization: `Bearer ${account.body.accessToken}` };
        const started = await request(app)
            .post("/api/v1/sessions/start")
            .set(auth)
            .send({ task: "Research", category: "Neutral" })
            .expect(201);
        const id = started.body.session._id;
        await request(app).post(`/api/v1/sessions/${id}/heartbeat`).set(auth).expect(200);
        await request(app).post(`/api/v1/sessions/${id}/idle`).set(auth).send({ idle: true }).expect(200);
        await request(app).post(`/api/v1/sessions/${id}/idle`).set(auth).send({ idle: false }).expect(200);
        await request(app).patch(`/api/v1/sessions/${id}/tags`).set(auth)
            .send({ tags: ["research", "planning"], category: "Productive" }).expect(200)
            .expect((res) => assert.deepEqual(res.body.session.tags, ["research", "planning"]));
        await request(app).patch(`/api/v1/sessions/${id}/tags`).set(auth)
            .send({ tags: [], task: "Design review" }).expect(200)
            .expect((res) => assert.equal(res.body.session.task, "Design review"));
        await request(app).patch(`/api/v1/sessions/${id}/tags`).set(auth)
            .send({ tags: [], task: "Development" }).expect(200)
            .expect((res) => assert.equal(res.body.session.task, "Development"));
        await request(app).post(`/api/v1/sessions/${id}/pause`).set(auth).expect(200);
        await request(app).patch(`/api/v1/sessions/${id}/tags`).set(auth)
            .send({ tags: [], task: "Customer research" }).expect(200)
            .expect((res) => assert.equal(res.body.session.task, "Customer research"));
        await request(app).post(`/api/v1/sessions/${id}/resume`).set(auth).expect(200);
        await request(app).post(`/api/v1/sessions/${id}/stop`).set(auth).send({}).expect(200);
        const history = await request(app).get("/api/v1/sessions/history?page=1&limit=5").set(auth).expect(200);
        assert.equal(history.body.items.length, 1);
        assert.equal(history.body.pagination.total, 1);
        const summary = await request(app).get("/api/v1/sessions/summary?range=30d").set(auth).expect(200);
        assert.equal(summary.body.summary.sessionCount, 1);
        await request(app).post("/api/v1/sessions/heartbeat").set(auth)
            .send({ sessionId: id }).expect(404);
    });
    it("persists Razorpay event idempotency after successful handling", async () => {
        const event = {
            event: "subscription.pending",
            payload: {},
        };
        assert.deepEqual(await processRazorpayEvent(event, "evt_idempotency_test"), { duplicate: false });
        assert.deepEqual(await processRazorpayEvent(event, "evt_idempotency_test"), { duplicate: true });
    });
    it("returns analytics trends and heatmap only for sufficiently sized groups", async () => {
        const account = await signupAndSignin("analytics@example.test");
        const { organizationId, teamId } = account.body.user;
        const quietTeam = await Team.create({ organizationId, name: "Quiet team" });
        await PulseResponse.insertMany(Array.from({ length: 5 }, () => ({
            organizationId,
            teamId,
            weekStart: weekStart(),
            mood: 3,
            stress: 4,
            workload: 4,
        })));
        await PulseResponse.insertMany(Array.from({ length: 4 }, () => ({
            organizationId,
            teamId: quietTeam._id,
            weekStart: weekStart(),
            mood: 1,
            stress: 5,
            workload: 5,
        })));
        const auth = { Authorization: `Bearer ${account.body.accessToken}` };
        const trends = await request(app).get("/api/v1/analytics/trends?weeks=4").set(auth).expect(200);
        assert.equal(trends.body.minimumGroupSize, 5);
        assert.equal(trends.body.trends.length, 1);
        assert.equal(trends.body.trends[0].weeks[0].responses, 5);
        const heatmap = await request(app).get("/api/v1/analytics/heatmap?weeks=4").set(auth).expect(200);
        assert.equal(heatmap.body.cells.length, 1);
        assert.equal(heatmap.body.cells[0].riskScore, 73);
        assert.deepEqual(heatmap.body.teams.map((team) => team.name).sort(), ["General", "Quiet team"]);
        assert.equal(heatmap.body.cells.some((cell) => cell.teamId === String(quietTeam._id)), false);
    });
    it("allows monitoring previews during trial but requires an active plan for exports", async () => {
        const account = await signupAndSignin("report-gates@example.test");
        const auth = { Authorization: `Bearer ${account.body.accessToken}` };
        await request(app).get("/api/v1/reports/preview").set(auth).expect(200);
        const generate = await request(app).post("/api/v1/reports/generate").set(auth)
            .send({ period: "30d", metrics: ["Active time"], format: "csv" }).expect(402);
        assert.equal(generate.body.error.code, "SUBSCRIPTION_REQUIRED");
        await User.updateMany({ organizationId: account.body.user.organizationId }, { $set: {
            "subscription.status": "trial_expired",
        } });
        const expiredPreview = await request(app).get("/api/v1/reports/preview").set(auth).expect(402);
        assert.equal(expiredPreview.body.error.code, "SUBSCRIPTION_REQUIRED");
    });
    it("includes the current week's pulse responses in a today report", async () => {
        const account = await signupAndSignin("report-pulse-today@example.test");
        await User.updateMany({ organizationId: account.body.user.organizationId }, { $set: { "subscription.status": "active", "subscription.plan": "Team" } });
        await PulseResponse.insertMany(Array.from({ length: 5 }, () => ({
            organizationId: account.body.user.organizationId,
            teamId: account.body.user.teamId,
            weekStart: weekStart(),
            mood: 3,
            stress: 3,
            workload: 3,
        })));
        const preview = await request(app)
            .get("/api/v1/reports/preview?period=today&metrics=Team%20pulse")
            .set("Authorization", `Bearer ${account.body.accessToken}`)
            .expect(200);
        assert.equal(preview.body.pulseParticipationResponses, 5);
    });
    it("generates and downloads tenant-scoped reports for an active Team plan", async () => {
        const account = await signupAndSignin("report-download@example.test");
        await User.updateMany({ organizationId: account.body.user.organizationId }, { $set: { "subscription.status": "active", "subscription.plan": "Team" } });
        const auth = { Authorization: `Bearer ${account.body.accessToken}` };
        const created = await request(app).post("/api/v1/reports/generate").set(auth)
            .send({ period: "30d", metrics: ["Active time", "Team pulse"], format: "csv" }).expect(201);
        const reportId = created.body.report.id;
        assert.ok(await GeneratedReport.exists({ _id: reportId }));
        const file = await request(app).get(`/api/v1/reports/${reportId}`).set(auth).expect(200);
        assert.match(file.headers["content-type"], /text\/csv/);
        assert.match(file.text, /Metric,Value/);
    });
    it("expires trials and persists invoices from Razorpay webhook events", async () => {
        const account = await signupAndSignin("invoice@example.test");
        await User.updateMany({ organizationId: account.body.user.organizationId }, { $set: {
                "subscription.razorpaySubscriptionId": "sub_invoice",
                "subscription.trialEndsAt": new Date(Date.now() - 1000),
            } });
        assert.ok(await expireTrials() >= 1);
        const event = {
            event: "subscription.charged",
            payload: {
                subscription: { entity: {
                    id: "sub_invoice",
                    status: "active",
                    current_end: 1792592000,
                    notes: { organizationId: account.body.user.organizationId, plan: "Team" },
                } },
                payment: { entity: {
                    id: "pay_test",
                    invoice_id: "PULSE-1",
                    currency: "INR",
                    amount: 160000,
                    status: "captured",
                    created_at: 1790000000,
                } },
            },
        };
        await processRazorpayEvent(event, "evt_invoice_paid");
        const invoice = await Invoice.findOne({ providerInvoiceId: "pay_test" }).lean();
        assert.equal(invoice?.amountPaid, 160000);
        assert.equal(invoice?.number, "PULSE-1");
        assert.ok(await User.exists({ _id: account.body.user.id, "subscription.status": "active" }));
    });
    it("verifies Razorpay signatures against the unparsed webhook payload", async () => {
        const oldWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const secret = "razorpay_webhook_test_secret";
        process.env.RAZORPAY_WEBHOOK_SECRET = secret;
        try {
            const payload = JSON.stringify({
                event: "payment.authorized",
                payload: {},
            });
            const signature = createHmac("sha256", secret).update(payload).digest("hex");
            const response = await request(app)
                .post("/api/v1/webhooks/razorpay")
                .set("Content-Type", "application/json")
                .set("X-Razorpay-Signature", signature)
                .send(payload)
                .expect(200);
            assert.equal(response.body.received, true);
            await request(app)
                .post("/api/v1/webhooks/razorpay")
                .set("Content-Type", "application/json")
                .set("X-Razorpay-Signature", "invalid")
                .send(payload)
                .expect(400);
        }
        finally {
            if (oldWebhookSecret === undefined)
                delete process.env.RAZORPAY_WEBHOOK_SECRET;
            else
                process.env.RAZORPAY_WEBHOOK_SECRET = oldWebhookSecret;
        }
    });
    it("does not allow report exports during a trial", async () => {
        const account = await signupAndSignin("reports@example.test");
        await request(app)
            .get("/api/v1/reports/export?format=csv")
            .set("Authorization", `Bearer ${account.body.accessToken}`)
            .expect(402)
            .expect((res) => assert.equal(res.body.error.code, "SUBSCRIPTION_REQUIRED"));
    });

    it("allows only the configured platform administrator to manage businesses, users, teams, activity, and attendance", async () => {
        const owner = await signupAndSignin("platform-owner@example.test", "Platform Owner");
        const invitationResponse = await request(app).post("/api/v1/workspace/invitations")
            .set("Authorization", `Bearer ${owner.body.accessToken}`)
            .send({ email: "platform-employee@example.test", teamId: owner.body.user.teamId }).expect(201);
        const invitation = invitationResponse.body.invitation;
        const invitedEmployee = await request(app).post("/api/v1/auth/accept-invitation")
            .send({ token: invitation.token, email: invitation.email, name: "Platform Employee", password: "correct-horse-battery" }).expect(201);
        const employeeSession = await createTestSession({ email: "platform-employee@example.test", password: "correct-horse-battery" });
        const employeeId = invitedEmployee.body.user.id;

        await request(app).get("/api/v1/operations/overview").expect(401);
        await request(app).post("/api/v1/operations/auth/signin").send({}).expect(401);
        const adminLogin = await request(app).post("/api/v1/operations/auth/login")
            .send({
                email: process.env.OPS_ADMIN_EMAIL,
                password: process.env.OPS_ADMIN_INITIAL_PASSWORD,
            }).expect(200);
        const adminCookie = adminLogin.headers["set-cookie"]
            .find((value) => value.startsWith("calmwork_operations=")).split(";")[0];
        const asAdmin = (method, path) => request(app)[method](path).set("Cookie", adminCookie);
        const businessList = await asAdmin("get", "/api/v1/operations/businesses").expect(200);
        assert.ok(businessList.body.businesses.some((business) => business.name === "Platform Owner's workspace"));
        const team = await asAdmin("post", "/api/v1/operations/teams")
            .send({ organizationId: owner.body.user.organizationId, name: "Operations" }).expect(201);
        const assigned = await asAdmin("patch", `/api/v1/operations/users/${employeeId}/team`)
            .send({ teamId: team.body.team._id }).expect(200);
        assert.equal(assigned.body.user.teamId._id, team.body.team._id);
        await asAdmin("delete", `/api/v1/operations/teams/${team.body.team._id}`).expect(400);
        const emptyTeam = await asAdmin("post", "/api/v1/operations/teams")
            .send({ organizationId: owner.body.user.organizationId, name: "Archive me" }).expect(201);
        await asAdmin("delete", `/api/v1/operations/teams/${emptyTeam.body.team._id}`).expect(200);

        const startedAt = new Date();
        await Attendance.create({
            userId: employeeId,
            organizationId: owner.body.user.organizationId,
            checkedInAt: startedAt,
            checkedOutAt: new Date(startedAt.getTime() + 60_000),
            durationSeconds: 60,
        });
        await TeamActivity.create({
            organizationId: owner.body.user.organizationId,
            teamId: team.body.team._id,
            userId: employeeId,
            task: "Private task label",
            category: "Productive",
            startedAt,
            endedAt: new Date(startedAt.getTime() + 60_000),
            activeSeconds: 60,
            idleSeconds: 10,
            status: "stopped",
        });
        const date = startedAt.toISOString().slice(0, 10);
        const activity = await asAdmin("get", `/api/v1/operations/activity?date=${date}`).expect(200);
        assert.equal(activity.body.businesses[0].activeSeconds, 60);
        assert.equal(activity.body.businesses[0].task, undefined);
        const attendance = await asAdmin("get", `/api/v1/operations/attendance?date=${date}`).expect(200);
        assert.equal(attendance.body.records[0].email, "platform-employee@example.test");
        const csv = await asAdmin("get", `/api/v1/operations/attendance/export?date=${date}`).expect(200);
        assert.match(csv.text, /platform-employee@example\.test/);

        const disabled = await asAdmin("patch", `/api/v1/operations/users/${employeeId}`)
            .send({ isActive: false }).expect(200);
        assert.equal(disabled.body.user.isActive, false);
        await request(app).get("/api/v1/workspace/teams")
            .set("Authorization", `Bearer ${employeeSession.accessToken}`).expect(401);
        const business = businessList.body.businesses.find((item) => item._id === owner.body.user.organizationId);
        await asAdmin("patch", `/api/v1/operations/businesses/${business._id}`).send({ isActive: false }).expect(200);
        await request(app).get("/api/v1/workspace/teams")
            .set("Authorization", `Bearer ${owner.body.accessToken}`).expect(401);
        await asAdmin("post", "/api/v1/operations/auth/logout").expect(204);
    });

    it("reserves the platform administrator email from business signup", async () => {
        await request(app).post("/api/v1/auth/signup").send({
            name: "Admin",
            email: "admin@gmail.com",
            password: "correct-horse-battery",
        }).expect(409);
    });
    it("rejects password sign-in attempts and keeps unauthenticated admin access closed", async () => {
        await request(app).get("/health").expect(200);
        await request(app).post("/api/v1/auth/signin").send({ email: "person@example.test", password: "password" }).expect(401);
        await request(app).post("/api/v1/operations/auth/signin").send({}).expect(401);
    });

    it("gives business admins a scoped console for members, invitations, teams, settings and audit history", async () => {
        const owner = await signupAndSignin("business-admin@example.test", "Business Admin");
        const auth = { Authorization: `Bearer ${owner.body.accessToken}` };
        const teamId = owner.body.user.teamId;

        const overview = await request(app).get("/api/v1/admin/overview").set(auth).expect(200);
        assert.equal(overview.body.overview.members, 1);
        assert.equal(overview.body.overview.admins, 1);
        assert.equal(overview.body.overview.teams, 1);
        assert.equal(overview.body.overview.pulse.participation, 0);

        const invitation = await request(app).post("/api/v1/admin/invitations").set(auth)
            .send({ email: "Admin-Invitee@Example.test", teamId, role: "manager" }).expect(201);
        assert.equal(invitation.body.invitation.email, "admin-invitee@example.test");
        assert.equal(invitation.body.invitation.role, "manager");
        assert.ok(invitation.body.invitation.token);

        const pending = await request(app).get("/api/v1/admin/invitations").set(auth).expect(200);
        assert.equal(pending.body.invitations.length, 1);
        assert.equal(pending.body.invitations[0].teamName, "General");

        const resent = await request(app).post("/api/v1/admin/invitations/admin-invitee@example.test/resend")
            .set(auth).expect(201);
        assert.notEqual(resent.body.invitation.token, invitation.body.invitation.token);
        await request(app).post("/api/v1/auth/accept-invitation").send({
            token: invitation.body.invitation.token,
            email: "admin-invitee@example.test",
            name: "Stale Invite",
            password: "correct-horse-battery",
        }).expect(401);
        const accepted = await request(app).post("/api/v1/auth/accept-invitation").send({
            token: resent.body.invitation.token,
            email: "admin-invitee@example.test",
            name: "Invited Manager",
            password: "correct-horse-battery",
        }).expect(201);
        assert.equal(accepted.body.user.role, "manager");

        const members = await request(app).get("/api/v1/admin/members?q=invited&role=manager").set(auth).expect(200);
        assert.equal(members.body.members.length, 1);
        const memberId = members.body.members[0].id;
        assert.equal(members.body.members[0].teamName, "General");

        const createdTeam = await request(app).post("/api/v1/admin/teams").set(auth)
            .send({ name: "Operations" }).expect(201);
        await request(app).post("/api/v1/admin/teams").set(auth).send({ name: "Operations" }).expect(409);
        const renamed = await request(app).patch(`/api/v1/admin/teams/${createdTeam.body.team.id}`).set(auth)
            .send({ name: "Ops" }).expect(200);
        assert.equal(renamed.body.team.name, "Ops");

        const moved = await request(app).patch(`/api/v1/admin/members/${memberId}`).set(auth)
            .send({ teamId: createdTeam.body.team.id, role: "employee" }).expect(200);
        assert.equal(moved.body.member.role, "employee");
        assert.equal(moved.body.member.teamName, "Ops");
        await request(app).delete(`/api/v1/admin/teams/${createdTeam.body.team.id}`).set(auth).expect(400);
        await request(app).patch(`/api/v1/admin/members/${memberId}`).set(auth).send({ teamId }).expect(200);
        await request(app).delete(`/api/v1/admin/teams/${createdTeam.body.team.id}`).set(auth).expect(200);

        const selfDemotion = await request(app).patch(`/api/v1/admin/members/${owner.body.user.id}`).set(auth)
            .send({ role: "employee" }).expect(400);
        assert.equal(selfDemotion.body.error.message, "You cannot change your own role");

        const settings = await request(app).get("/api/v1/admin/settings").set(auth).expect(200);
        assert.equal(settings.body.organization.name, "Business Admin's workspace");
        assert.equal(settings.body.pulseCatalog.length, 3);
        const updatedSettings = await request(app).patch("/api/v1/admin/settings").set(auth)
            .send({ minGroupSize: 6 }).expect(200);
        assert.equal(updatedSettings.body.organization.minGroupSize, 6);

        const audit = await request(app).get("/api/v1/admin/audit-logs").set(auth).expect(200);
        const actions = audit.body.logs.map((log) => log.action);
        assert.ok(actions.includes("invitation.created"));
        assert.ok(actions.includes("member.updated"));
        assert.ok(actions.includes("team.archived"));
        assert.ok(actions.includes("settings.updated"));
        assert.equal(Object.hasOwn(audit.body.logs[0], "metadata"), false);

        const employeeSession = await createTestSession({
            email: "admin-invitee@example.test",
            password: "correct-horse-battery",
        });
        await request(app).get("/api/v1/admin/overview")
            .set("Authorization", `Bearer ${employeeSession.accessToken}`).expect(403);

        const outsider = await signupAndSignin("outside-admin@example.test", "Outside Admin");
        const outsiderAuth = { Authorization: `Bearer ${outsider.body.accessToken}` };
        const outsiderOverview = await request(app).get("/api/v1/admin/overview").set(outsiderAuth).expect(200);
        assert.equal(outsiderOverview.body.overview.members, 1);
        await request(app).patch(`/api/v1/admin/members/${memberId}`).set(outsiderAuth)
            .send({ role: "admin" }).expect(404);
        const outsiderMembers = await request(app).get("/api/v1/admin/members").set(outsiderAuth).expect(200);
        assert.equal(outsiderMembers.body.members.length, 1);
    });

    it("deprovisions disabled members and protects the last business admin", async () => {
        const owner = await signupAndSignin("last-admin@example.test", "Last Admin");
        const auth = { Authorization: `Bearer ${owner.body.accessToken}` };
        const teammate = await User.create({
            organizationId: owner.body.user.organizationId,
            teamId: owner.body.user.teamId,
            name: "Second Admin",
            email: "second-admin@example.test",
            passwordHash: await bcrypt.hash("correct-horse-battery", 4),
            role: "admin",
            subscription: { plan: "Team", status: "trialing", trialEndsAt: new Date(Date.now() + 86_400_000) },
        });
        const teammateSession = await createTestSession({
            email: "second-admin@example.test",
            password: "correct-horse-battery",
        });
        const disabled = await request(app).patch(`/api/v1/admin/members/${teammate.id}`).set(auth)
            .send({ isActive: false }).expect(200);
        assert.equal(disabled.body.member.isActive, false);
        await request(app).get("/api/v1/workspace/teams")
            .set("Authorization", `Bearer ${teammateSession.accessToken}`).expect(401);
        const demoted = await request(app).patch(`/api/v1/admin/members/${teammate.id}`).set(auth)
            .send({ role: "employee", isActive: true }).expect(200);
        assert.equal(demoted.body.member.role, "employee");
        const lastAdmin = await request(app).patch(`/api/v1/admin/members/${teammate.id}`).set(auth)
            .send({ isActive: false }).expect(200);
        assert.equal(lastAdmin.body.member.isActive, false);
        await request(app).patch(`/api/v1/admin/members/${teammate.id}`).set(auth)
            .send({ teamId: new mongoose.Types.ObjectId().toString() }).expect(404);
    });

    it("lets business admins triage wellbeing alerts and review generated reports", async () => {
        const owner = await signupAndSignin("alert-admin@example.test");
        const auth = { Authorization: `Bearer ${owner.body.accessToken}` };
        const alert = await Alert.create({
            organizationId: owner.body.user.organizationId,
            teamId: owner.body.user.teamId,
            type: "burnout_risk",
            key: "burnout:general",
            title: "Elevated burnout risk",
            detail: "Aggregate stress scores rose this week.",
            severity: "high",
            score: 82,
            metrics: { stress: 4.4 },
        });
        const listed = await request(app).get("/api/v1/admin/alerts?status=open").set(auth).expect(200);
        assert.equal(listed.body.alerts.length, 1);
        assert.equal(listed.body.openCount, 1);
        assert.equal(listed.body.alerts[0].teamName, "General");
        const acknowledged = await request(app).patch(`/api/v1/admin/alerts/${alert._id}`).set(auth)
            .send({ status: "acknowledged" }).expect(200);
        assert.equal(acknowledged.body.alert.status, "acknowledged");
        await request(app).patch(`/api/v1/admin/alerts/${alert._id}`).set(auth)
            .send({ status: "open" }).expect(400);

        await GeneratedReport.create({
            organizationId: owner.body.user.organizationId,
            createdBy: owner.body.user.id,
            period: "30d",
            metrics: ["Active time"],
            format: "csv",
            contentType: "text/csv",
            filename: "pulse-report.csv",
            content: Buffer.from("Metric,Value"),
            expiresAt: new Date(Date.now() + 86_400_000),
        });
        const reports = await request(app).get("/api/v1/admin/reports").set(auth).expect(200);
        assert.equal(reports.body.reports.length, 1);
        assert.equal(reports.body.reports[0].filename, "pulse-report.csv");
        assert.equal(Object.hasOwn(reports.body.reports[0], "content"), false);
        assert.equal(reports.body.reports[0].createdByName, "Test User");
    });
});
