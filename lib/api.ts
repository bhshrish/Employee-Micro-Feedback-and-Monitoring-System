export type PlanName = "Starter" | "Team" | "Business";
export type BillingCycle = "monthly" | "yearly";

export interface DashboardData {
  kpis: { total: string; active: string; idle: string; productive: number; weekly: string; streak: number };
  daily: { label: string; active: number; idle: number }[];
  weekly: { day: string; productive: number; neutral: number; idle: number }[];
  trend: number[];
}

export interface TeamData {
  teams: { name: string; mood: number; stress: number; workload: number; participation: number; responses: number; trend: number[] }[];
  alerts: { id: number; title: string; detail: string; severity: "High" | "Medium" | "Low"; time: string }[];
}

export const plans = [
  { name: "Starter" as const, monthly: 8, description: "For individuals building healthier work habits.", features: ["Personal time tracking", "Idle detection", "Weekly pulse", "7-day free trial"] },
  { name: "Team" as const, monthly: 16, description: "For teams turning signals into better support.", features: ["Everything in Starter", "Anonymous team scorecards", "Burnout-risk alerts", "CSV & PDF reports"] },
  { name: "Business" as const, monthly: 28, description: "For organizations supporting every team.", features: ["Everything in Team", "Unlimited teams", "Advanced trends", "Priority support"] },
];

const wait = (ms = 420) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDashboardData(range: "Today" | "7d" | "30d"): Promise<DashboardData> {
  await wait();
  const factor = range === "Today" ? 1 : range === "7d" ? 1.16 : 1.32;
  return {
    kpis: { total: `${(6.4 * factor).toFixed(1)}h`, active: `${(5.8 * factor).toFixed(1)}h`, idle: `${Math.round(36 * factor)}m`, productive: Math.round(82 / Math.sqrt(factor)), weekly: `${(31.5 * factor).toFixed(1)}h`, streak: 12 },
    daily: ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm"].map((label, i) => ({ label, active: [42, 55, 48, 58, 22, 51, 56, 44, 38][i], idle: [8, 3, 7, 2, 28, 5, 3, 11, 9][i] })),
    weekly: ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => ({ day, productive: [5.8, 6.4, 5.9, 6.8, 5.2][i] * factor, neutral: [1.1, .8, 1.3, .7, 1.4][i], idle: [.5, .4, .7, .3, .6][i] })),
    trend: [68, 72, 70, 76, 74, 79, 81, 78, 84, 82, 86, 88].map((n) => Math.min(96, Math.round(n * Math.sqrt(factor)))),
  };
}

export async function getTeamData(): Promise<TeamData> {
  await wait(520);
  return {
    teams: [
      { name: "Engineering", mood: 3.4, stress: 3.9, workload: 4.1, participation: 89, responses: 18, trend: [4.1, 4, 3.9, 3.8, 3.6, 3.5, 3.4] },
      { name: "Design", mood: 4.2, stress: 2.7, workload: 3.1, participation: 94, responses: 8, trend: [3.9, 4, 4.1, 4, 4.2, 4.1, 4.2] },
      { name: "Customer Success", mood: 3.8, stress: 3.2, workload: 3.5, participation: 82, responses: 11, trend: [3.6, 3.7, 3.8, 3.7, 3.9, 3.8, 3.8] },
      { name: "Operations", mood: 0, stress: 0, workload: 0, participation: 0, responses: 4, trend: [] },
    ],
    alerts: [
      { id: 1, title: "Engineering stress up 18% for 3 weeks", detail: "Workload is also trending above the team baseline. Consider a workload review.", severity: "High", time: "2h ago" },
      { id: 2, title: "Design participation reached 94%", detail: "A strong signal that the weekly check-in is becoming a habit.", severity: "Low", time: "Yesterday" },
      { id: 3, title: "Customer Success workload above baseline", detail: "Aggregated workload increased 9% this week.", severity: "Medium", time: "2 days ago" },
    ],
  };
}

export async function authenticate(email: string, _password: string, mode: "signin" | "signup") {
  await wait(650);
  if (!email.includes("@")) throw new Error("Enter a valid work email.");
  return { id: "demo-user", name: email.split("@")[0].replace(/[._-]/g, " "), email, mode };
}

export async function submitPulse(_payload: { mood: number; stress: number; workload: number; comment: string }) {
  await wait(550);
  return { ok: true, submittedAt: new Date().toISOString() };
}

export async function getInvoices() {
  await wait(300);
  return [{ id: "INV-2026-1042", date: "Oct 28, 2026", amount: "$16.00", status: "Demo" }];
}

export async function getReportSummary(period: string, metrics: string[]) {
  await wait(380);
  return { period, metrics, activeHours: 164.8, productivity: 84, pulseParticipation: 89, riskTeams: 1, generatedAt: new Date().toISOString() };
}
