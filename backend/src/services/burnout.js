"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateResponseBurnoutScore = calculateResponseBurnoutScore;
exports.calculateBurnoutScore = calculateBurnoutScore;
const clamp = (value) => Math.min(100, Math.max(0, value));
const normalize = (value) => clamp(((value - 1) / 4) * 100);
const severityFor = (score) => score >= 65 ? "high" : score >= 40 ? "medium" : "low";
function calculateResponseBurnoutScore(answers) {
    const components = {
        mood: Math.round(normalize(6 - answers.mood)),
        stress: Math.round(normalize(answers.stress)),
        exhaustion: Math.round(normalize(answers.exhaustion)),
        workload: Math.round(normalize(answers.workload)),
        recovery: Math.round(normalize(6 - answers.recovery)),
        control: Math.round(normalize(6 - answers.control)),
        support: Math.round(normalize(6 - answers.support)),
    };
    const score = Math.round(Object.values(components).reduce((sum, value) => sum + value, 0) / 7);
    return {
        score,
        components,
        severity: severityFor(score),
    };
}
function calculateBurnoutScore(metrics) {
    const stressRisk = normalize(metrics.stress);
    const reportedWorkloadRisk = normalize(metrics.workload);
    const workloadRisk = metrics.operationalWorkload === undefined
        ? reportedWorkloadRisk
        : 0.7 * reportedWorkloadRisk + 0.3 * normalize(metrics.operationalWorkload);
    const moodRisk = normalize(6 - metrics.mood);
    const participationRisk = clamp((1 - metrics.participation) * 100);
    const baseRisk = 0.3 * stressRisk + 0.25 * workloadRisk + 0.25 * moodRisk + 0.2 * participationRisk;
    const hasPrevious = metrics.previousStress !== undefined
        && metrics.previousWorkload !== undefined
        && metrics.previousMood !== undefined
        && metrics.previousParticipation !== undefined;
    const previousWorkloadRisk = metrics.previousOperationalWorkload === undefined
        ? normalize(metrics.previousWorkload)
        : 0.7 * normalize(metrics.previousWorkload) + 0.3 * normalize(metrics.previousOperationalWorkload);
    const previousRisk = hasPrevious
        ? 0.3 * normalize(metrics.previousStress)
            + 0.25 * previousWorkloadRisk
            + 0.25 * normalize(6 - metrics.previousMood)
            + 0.2 * clamp((1 - metrics.previousParticipation) * 100)
        : baseRisk;
    const weekOverWeekIncrease = clamp(baseRisk - previousRisk);
    const score = Math.round(0.9 * baseRisk + 0.1 * weekOverWeekIncrease);
    return {
        score,
        components: {
            stress: Math.round(stressRisk),
            workload: Math.round(workloadRisk),
            ...(metrics.operationalWorkload === undefined ? {} : { operationalWorkload: Math.round(normalize(metrics.operationalWorkload)) }),
            inverseMood: Math.round(moodRisk),
            participation: Math.round(participationRisk),
            weekOverWeekIncrease: Math.round(weekOverWeekIncrease),
        },
        severity: severityFor(score),
    };
}
