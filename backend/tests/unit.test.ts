import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { weekStart } from "../src/utils/week";
import { pulseSchema, signupSchema } from "../src/schemas";
import { calculateBurnoutScore } from "../src/services/burnout";

describe("validation and date utilities", () => {
  it("rejects unknown fields and ratings outside the pulse range", () => {
    assert.equal(pulseSchema.safeParse({ mood: 4, stress: 2, workload: 3, note: "extra" }).success, false);
    assert.equal(pulseSchema.safeParse({ mood: 6, stress: 2, workload: 3 }).success, false);
  });

  it("normalizes email casing and enforces password length limits", () => {
    const result = signupSchema.safeParse({ name: "Alex Morgan", email: "ALEX@example.test", password: "strong-pass-123" });
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.email, "alex@example.test");
    assert.equal(signupSchema.safeParse({ name: "Alex", email: "alex@example.test", password: "x" }).success, false);
  });

  it("uses a stable UTC Monday as the pulse week boundary", () => {
    const result = weekStart(new Date("2026-10-29T16:30:00.000Z"));
    assert.equal(result.toISOString(), "2026-10-26T00:00:00.000Z");
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
