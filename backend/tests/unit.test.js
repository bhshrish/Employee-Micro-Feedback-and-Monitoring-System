import assert from "node:assert/strict";
import request from "supertest";
import { describe, it } from "vitest";
import { createApp } from "../src/app";
import { pulseWeekRange, weekStart } from "../src/utils/week";
import { pulseSchema, signupSchema } from "../src/schemas";
import { calculateBurnoutScore } from "../src/services/burnout";

describe("CORS", () => {
    it("allows preflight requests when a configured origin has a trailing slash", async () => {
        const previousCorsOrigins = process.env.CORS_ORIGINS;
        const origin = "https://employee-micro-feedback-and-monitor-omega.vercel.app";
        process.env.CORS_ORIGINS = `${origin}/`;
        try {
            let databaseConnectionAttempted = false;
            const response = await request(createApp({
                ensureDatabaseConnected: async () => {
                    databaseConnectionAttempted = true;
                },
            }))
                .options("/api/v1/auth/signin")
                .set("Origin", origin)
                .set("Access-Control-Request-Method", "POST")
                .set("Access-Control-Request-Headers", "content-type")
                .expect(204);
            assert.equal(response.headers["access-control-allow-origin"], origin);
            assert.equal(response.headers["access-control-allow-credentials"], "true");
            assert.equal(databaseConnectionAttempted, false);
        }
        finally {
            if (previousCorsOrigins === undefined)
                delete process.env.CORS_ORIGINS;
            else
                process.env.CORS_ORIGINS = previousCorsOrigins;
        }
    });

    it("includes CORS headers when the database connection fails", async () => {
        const previousCorsOrigins = process.env.CORS_ORIGINS;
        const origin = "https://employee-micro-feedback-and-monitor-omega.vercel.app";
        process.env.CORS_ORIGINS = origin;
        try {
            const response = await request(createApp({
                ensureDatabaseConnected: async () => {
                    throw new Error("database unavailable");
                },
            }))
                .post("/api/v1/auth/signin")
                .send({ email: "person@example.test", password: "example-password" })
                .set("Origin", origin)
                .expect(500);
            assert.equal(response.headers["access-control-allow-origin"], origin);
            assert.equal(response.headers["access-control-allow-credentials"], "true");
        }
        finally {
            if (previousCorsOrigins === undefined)
                delete process.env.CORS_ORIGINS;
            else
                process.env.CORS_ORIGINS = previousCorsOrigins;
        }
    });

    it("keeps liveness independent of MongoDB and reports readiness as unavailable", async () => {
        const app = createApp({
            ensureDatabaseConnected: async () => {
                throw new Error("database unavailable");
            },
        });
        await request(app).get("/health").expect(200).expect({ status: "ok" });
        await request(app).get("/health/live").expect(200).expect({ status: "ok" });
        await request(app).get("/health/ready").expect(503).expect({
            status: "not_ready",
            dependencies: { mongodb: "unavailable" },
        });
    });
});

describe("validation and date utilities", () => {
    it("rejects unknown fields and ratings outside the pulse range", () => {
        assert.equal(pulseSchema.safeParse({ mood: 4, stress: 2, workload: 3, note: "extra" }).success, false);
        assert.equal(pulseSchema.safeParse({ mood: 6, stress: 2, workload: 3 }).success, false);
    });
    it("normalizes email casing and enforces password length limits", () => {
        const result = signupSchema.safeParse({ name: "Alex Morgan", email: "ALEX@example.test", password: "strong-pass-123" });
        assert.equal(result.success, true);
        if (result.success)
            assert.equal(result.data.email, "alex@example.test");
        assert.equal(signupSchema.safeParse({ name: "Alex", email: "alex@example.test", password: "x" }).success, false);
    });
    it("uses a stable UTC Monday as the pulse week boundary", () => {
        const result = weekStart(new Date("2026-10-29T16:30:00.000Z"));
        assert.equal(result.toISOString(), "2026-10-26T00:00:00.000Z");
    });
    it("maps calendar report periods onto pulse week starts so today includes the current week", () => {
        const currentWeek = weekStart();
        const today = pulseWeekRange("today");
        assert.equal(today.start.toISOString(), currentWeek.toISOString());
        assert.equal(today.end.toISOString(), currentWeek.toISOString());
    });
    it("calculates a weighted, participation-aware burnout score and severity", () => {
        const low = calculateBurnoutScore({ stress: 1, workload: 1, mood: 5, participation: 1 });
        assert.equal(low.score, 0);
        assert.equal(low.severity, "low");
        const high = calculateBurnoutScore({
            stress: 5,
            workload: 5,
            mood: 1,
            participation: 0.2,
            previousStress: 2,
            previousWorkload: 2,
            previousMood: 4,
            previousParticipation: 0.9,
        });
        assert.ok(high.score >= 65);
        assert.equal(high.severity, "high");
        assert.equal(high.components.participation, 80);
        assert.ok(high.components.weekOverWeekIncrease > 0);
    });
});
