"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBurnoutScore = calculateBurnoutScore;
var clamp = function (value) { return Math.min(100, Math.max(0, value)); };
var normalize = function (value) { return clamp(((value - 1) / 4) * 100); };
function calculateBurnoutScore(metrics) {
    var stressRisk = normalize(metrics.stress);
    var workloadRisk = normalize(metrics.workload);
    var moodRisk = normalize(6 - metrics.mood);
    var participationRisk = clamp((1 - metrics.participation) * 100);
    var baseRisk = 0.3 * stressRisk + 0.25 * workloadRisk + 0.25 * moodRisk + 0.2 * participationRisk;
    var hasPrevious = metrics.previousStress !== undefined
        && metrics.previousWorkload !== undefined
        && metrics.previousMood !== undefined
        && metrics.previousParticipation !== undefined;
    var previousRisk = hasPrevious
        ? 0.3 * normalize(metrics.previousStress)
            + 0.25 * normalize(metrics.previousWorkload)
            + 0.25 * normalize(6 - metrics.previousMood)
            + 0.2 * clamp((1 - metrics.previousParticipation) * 100)
        : baseRisk;
    var weekOverWeekIncrease = clamp(baseRisk - previousRisk);
    var score = Math.round(0.9 * baseRisk + 0.1 * weekOverWeekIncrease);
    return {
        score: score,
        components: {
            stress: Math.round(stressRisk),
            workload: Math.round(workloadRisk),
            inverseMood: Math.round(moodRisk),
            participation: Math.round(participationRisk),
            weekOverWeekIncrease: Math.round(weekOverWeekIncrease),
        },
        severity: score >= 65 ? "high" : score >= 40 ? "medium" : "low",
    };
}
