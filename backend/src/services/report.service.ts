import PDFDocument from "pdfkit";
import { stringify } from "csv-stringify/sync";
import type { Types } from "mongoose";
import { User } from "../models/User";
import { PulseResponse } from "../models/PulseResponse";
import { TeamActivity } from "../models/TeamActivity";
import { dateRange } from "../utils/week";
import { paymentRequired } from "../utils/errors";

export async function reportSummary(
  organizationId: Types.ObjectId,
  period: string,
  metrics: string[],
  minResponses = 5,
  teamId?: Types.ObjectId,
) {
  const { start, end } = dateRange(period);
  const [activity, pulse] = await Promise.all([
    TeamActivity.aggregate([
      { $match: { organizationId, ...(teamId ? { teamId } : {}), startedAt: { $gte: start, $lte: end }, status: "stopped" } },
      { $group: {
        _id: null,
        activeSeconds: { $sum: "$activeSeconds" },
        idleSeconds: { $sum: "$idleSeconds" },
        productiveSeconds: { $sum: { $cond: [{ $eq: ["$category", "Productive"] }, "$activeSeconds", 0] } },
        sessions: { $sum: 1 },
        users: { $addToSet: "$userId" },
      } },
    ]),
    PulseResponse.aggregate([
      { $match: { organizationId, ...(teamId ? { teamId } : {}), weekStart: { $gte: start, $lte: end } } },
      { $group: { _id: { teamId: "$teamId", weekStart: "$weekStart" }, count: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" } } },
    ]),
  ]);
  const aggregate = activity[0] ?? { activeSeconds: 0, idleSeconds: 0, sessions: 0 };
  const visiblePulseGroups = pulse.filter((group) => group.count >= minResponses);
  const atRisk = visiblePulseGroups.filter((group) => group.stress + group.workload + (6 - group.mood) >= 11).length;
  const totalPulse = visiblePulseGroups.reduce((sum, group) => sum + group.count, 0);
  const teamCount = await User.distinct("teamId", { organizationId, teamId: { $ne: null }, ...(teamId ? { teamId } : {}) }).then((ids) => ids.length);
  const activityVisible = (aggregate.users?.length ?? 0) >= minResponses;
  const activeSeconds = activityVisible ? aggregate.activeSeconds : 0;
  const idleSeconds = activityVisible ? aggregate.idleSeconds : 0;
  return {
    period,
    metrics,
    activeHours: Number((activeSeconds / 3600).toFixed(1)),
    idleHours: Number((idleSeconds / 3600).toFixed(1)),
    productivity: activeSeconds ? Math.round((aggregate.productiveSeconds / activeSeconds) * 100) : 0,
    pulseParticipationResponses: totalPulse,
    riskTeams: atRisk,
    teams: teamCount,
    sessions: activityVisible ? aggregate.sessions : 0,
    generatedAt: new Date().toISOString(),
  };
}

export async function exportReport(
  organizationId: Types.ObjectId,
  subscription: { plan: string; status: string; trialEndsAt: Date },
  period: string,
  metrics: string[],
  format: "csv" | "pdf",
  minResponses = 5,
  teamId?: Types.ObjectId,
) {
  if (subscription.status !== "active" || !["Team", "Business"].includes(subscription.plan)) {
    throw paymentRequired("Report generation requires an active Team or Business subscription");
  }
  const summary = await reportSummary(organizationId, period, metrics, minResponses, teamId);
  const rows: Array<[string, string | number]> = [["Period", summary.period]];
  const selected: Record<string, string | number> = {
    "Active time (hours)": summary.activeHours,
    "Idle time (hours)": summary.idleHours,
    Productivity: `${summary.productivity}%`,
    "Pulse responses (eligible groups only)": summary.pulseParticipationResponses,
    "Teams requiring support": summary.riskTeams,
    "Activity sessions": summary.sessions,
  };
  const mapping: Record<string, string[]> = {
    "Active time": ["Active time (hours)"],
    "Idle time": ["Idle time (hours)"],
    Productivity: ["Productivity"],
    "Team pulse": ["Pulse responses (eligible groups only)"],
    "Burnout risk": ["Teams requiring support"],
  };
  for (const metric of metrics) for (const key of mapping[metric] ?? []) rows.push([key, selected[key]]);
  if (format === "csv") return { contentType: "text/csv; charset=utf-8", filename: `pulse-report-${period}.csv`, content: stringify(rows, { header: true, columns: ["Metric", "Value"] }) };
  const pdf = new PDFDocument({ size: "A4", margin: 52, info: { Title: "PULSE report", Author: "PULSE" } });
  const chunks: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => {
    pdf.on("data", (chunk: Buffer) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);
  });
  pdf.fontSize(22).text("PULSE wellbeing report");
  pdf.moveDown().fontSize(11).fillColor("#555").text(`Period: ${period} · Generated ${new Date().toISOString()}`);
  pdf.moveDown().fillColor("#111");
  for (const [label, value] of rows.slice(1)) pdf.fontSize(12).text(`${label}: ${value}`);
  pdf.moveDown().fontSize(9).fillColor("#666").text(`Aggregated and anonymized. Groups below ${minResponses} responses are excluded. This report is not an individual performance assessment.`);
  pdf.end();
  return { contentType: "application/pdf", filename: `pulse-report-${period}.pdf`, content: await finished };
}
