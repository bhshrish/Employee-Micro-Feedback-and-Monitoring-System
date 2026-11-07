import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { createApp } from "../src/app";
import { PulseResponse } from "../src/models/PulseResponse";
import { PulseReceipt } from "../src/models/PulseReceipt";
import { Team } from "../src/models/Team";
import { User } from "../src/models/User";
import { TeamActivity } from "../src/models/TeamActivity";
import { Invoice } from "../src/models/Invoice";
import { GeneratedReport } from "../src/models/GeneratedReport";
import Stripe from "stripe";
import { processStripeEvent } from "../src/services/billing.service";
import { expireTrials } from "../src/jobs/subscriptions";
import { weekStart } from "../src/utils/week";
import { Organization } from "../src/models/Organization";
import { migrateLegacyData } from "../src/legacy-migration";
import { signin as createTestSession } from "../src/services/auth.service";
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
        headers: { "set-cookie": [`pulse_refresh=${session.refreshToken}`] },
    };
}
function accessCookie(response) {
    const value = response.headers["set-cookie"]?.find((cookie) => cookie.startsWith("pulse_refresh="));
    if (!value)
        throw new Error("refresh cookie missing");
    return value.split(";")[0];
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
        await request(app).post("/api/v1/auth/signin").send({
            email: email.toLowerCase(),
            password: "correct-horse-battery",
        }).expect(401);
        await request(app).post("/api/v1/auth/signin").send({
            email,
            password: "CORRECT-HORSE-BATTERY",
        }).expect(401);
        const signin = await request(app).post("/api/v1/auth/signin").send({
            email,
            password: "correct-horse-battery",
        }).expect(200);
        assert.ok(signin.body.accessToken);
        assert.match(accessCookie(signin), /^pulse_refresh=/);
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
        await request(app).post("/api/v1/webhooks/stripe")
            .set("Content-Type", "application/json").set("Stripe-Signature", "invalid")
            .send("{}").expect(503);
        await request(app).post("/api/v1/reports/preview").set(auth)
            .send({ period: "30d", metrics: ["Active time"], format: "pdf" }).expect(402)
            .expect((res) => assert.equal(res.body.error.code, "SUBSCRIPTION_REQUIRED"));
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
        const checkoutEvent = {
            id: "evt_workspace_subscription",
            type: "checkout.session.completed",
            data: {
                object: {
                    client_reference_id: owner.body.user.id,
                    customer: "cus_workspace",
                    subscription: "sub_workspace",
                    metadata: {
                        userId: owner.body.user.id,
                        organizationId: owner.body.user.organizationId,
                        plan: "Business",
                    },
                },
            },
        };
        await processStripeEvent(checkoutEvent);
        const updatedMember = await User.findById(member.body.user.id);
        assert.equal(updatedMember?.subscription.plan, "Business");
        assert.equal(updatedMember?.subscription.status, "active");
        await request(app)
            .patch(`/api/v1/workspace/members/${member.body.user.id}`)
            .set("Authorization", `Bearer ${owner.body.accessToken}`)
            .send({ role: "manager" })
            .expect(200);
        await request(app)
            .get("/api/v1/workspace/members")
            .set("Authorization", `Bearer ${member.body.accessToken}`)
            .expect(200)
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
            .expect(402)
            .expect((res) => assert.equal(res.body.error.code, "SUBSCRIPTION_REQUIRED"));
        await User.updateOne({ _id: first.body.user.id }, { $set: { "subscription.status": "trial_expired" } });
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
        await request(app).post(`/api/v1/sessions/${id}/stop`).set(auth).send({}).expect(200);
        const history = await request(app).get("/api/v1/sessions/history?page=1&limit=5").set(auth).expect(200);
        assert.equal(history.body.items.length, 1);
        assert.equal(history.body.pagination.total, 1);
        const summary = await request(app).get("/api/v1/sessions/summary?range=30d").set(auth).expect(200);
        assert.equal(summary.body.summary.sessionCount, 1);
        await request(app).post("/api/v1/sessions/heartbeat").set(auth)
            .send({ sessionId: id }).expect(404);
    });
    it("persists Stripe event idempotency after successful handling", async () => {
        const event = {
            id: "evt_idempotency_test",
            type: "customer.updated",
            data: { object: {} },
        };
        assert.deepEqual(await processStripeEvent(event), { duplicate: false });
        assert.deepEqual(await processStripeEvent(event), { duplicate: true });
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
    it("returns SUBSCRIPTION_REQUIRED for report preview and generation without an active plan", async () => {
        const account = await signupAndSignin("report-gates@example.test");
        const auth = { Authorization: `Bearer ${account.body.accessToken}` };
        const preview = await request(app).get("/api/v1/reports/preview").set(auth).expect(402);
        assert.equal(preview.body.error.code, "SUBSCRIPTION_REQUIRED");
        const generate = await request(app).post("/api/v1/reports/generate").set(auth)
            .send({ period: "30d", metrics: ["Active time"], format: "csv" }).expect(402);
        assert.equal(generate.body.error.code, "SUBSCRIPTION_REQUIRED");
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
    it("expires trials and persists invoices from Stripe webhook events", async () => {
        const account = await signupAndSignin("invoice@example.test");
        await User.updateMany({ organizationId: account.body.user.organizationId }, { $set: {
                "subscription.stripeCustomerId": "cus_invoice",
                "subscription.trialEndsAt": new Date(Date.now() - 1000),
            } });
        assert.ok(await expireTrials() >= 1);
        const event = {
            id: "evt_invoice_paid",
            type: "invoice.paid",
            data: {
                object: {
                    id: "in_test",
                    customer: "cus_invoice",
                    number: "PULSE-1",
                    currency: "usd",
                    amount_due: 1600,
                    amount_paid: 1600,
                    status: "paid",
                    hosted_invoice_url: "https://invoice.example.test/1",
                    invoice_pdf: "https://invoice.example.test/1.pdf",
                    period_start: 1790000000,
                    period_end: 1792592000,
                    created: 1790000000,
                },
            },
        };
        await processStripeEvent(event);
        const invoice = await Invoice.findOne({ stripeInvoiceId: "in_test" }).lean();
        assert.equal(invoice?.amountPaid, 1600);
        assert.equal(invoice?.number, "PULSE-1");
        assert.ok(await User.exists({ _id: account.body.user.id, "subscription.status": "active" }));
    });
    it("verifies Stripe signatures against the unparsed webhook payload", async () => {
        const oldStripeKey = process.env.STRIPE_SECRET_KEY;
        const oldWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        const secret = "whsec_webhook_test_secret";
        process.env.STRIPE_SECRET_KEY = "sk_test_webhook";
        process.env.STRIPE_WEBHOOK_SECRET = secret;
        try {
            const payload = JSON.stringify({
                id: "evt_raw_body_test",
                type: "customer.updated",
                data: { object: {} },
            });
            const stripe = new Stripe("sk_test_webhook");
            const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
            const response = await request(app)
                .post("/api/v1/billing/webhook")
                .set("Content-Type", "application/json")
                .set("Stripe-Signature", signature)
                .send(payload)
                .expect(200);
            assert.equal(response.body.received, true);
            await request(app)
                .post("/api/v1/billing/webhook")
                .set("Content-Type", "application/json")
                .set("Stripe-Signature", "t=1,v1=invalid")
                .send(payload)
                .expect(400);
        }
        finally {
            if (oldStripeKey === undefined)
                delete process.env.STRIPE_SECRET_KEY;
            else
                process.env.STRIPE_SECRET_KEY = oldStripeKey;
            if (oldWebhookSecret === undefined)
                delete process.env.STRIPE_WEBHOOK_SECRET;
            else
                process.env.STRIPE_WEBHOOK_SECRET = oldWebhookSecret;
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
});
