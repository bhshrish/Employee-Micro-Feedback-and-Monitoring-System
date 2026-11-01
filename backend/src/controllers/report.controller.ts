import { User } from "../models/User";
import { asyncHandler } from "../utils/async-handler";
import { exportReport, reportSummary } from "../services/report.service";
import { forbidden, paymentRequired, unauthorized, notFound, badRequest } from "../utils/errors";
import { GeneratedReport } from "../models/GeneratedReport";
import type { Types } from "mongoose";
import { organizationMinGroupSize } from "../services/pulse.service";

function reportTeamScope(req: import("express").Request) {
  if (!req.auth) throw unauthorized();
  if (req.auth.role === "admin") return undefined;
  if (req.auth.role !== "manager") throw forbidden("Reports are available to workspace managers only");
  if (!req.auth.teamId) throw forbidden("A manager must be assigned to a team");
  return req.auth.teamId;
}

async function activeReportSubscription(userId: Types.ObjectId, organizationId: Types.ObjectId) {
  const user = await User.findOne({ _id: userId, organizationId })
    .select("subscription.plan subscription.status subscription.trialEndsAt");
  if (!user) throw unauthorized();
  if (user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date()) {
    user.subscription.status = "trial_expired";
    await user.save();
  }
  if (user.subscription.status !== "active" || !["Team", "Business"].includes(user.subscription.plan)) {
    throw paymentRequired("Reports require an active Team or Business subscription");
  }
  return user.subscription;
}

export const summary = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const query = req.validatedQuery as { period: string; metrics: string[] };
  await activeReportSubscription(req.auth.userId, req.auth.organizationId);
  const result = await reportSummary(
    req.auth.organizationId,
    query.period,
    query.metrics,
    await organizationMinGroupSize(req.auth.organizationId),
    reportTeamScope(req),
  );
  res.json({ ...result, data: result });
});

export const preview = summary;

export const previewPost = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const { period, metrics } = req.body as { period: string; metrics: string[] };
  await activeReportSubscription(req.auth.userId, req.auth.organizationId);
  const result = await reportSummary(
    req.auth.organizationId,
    period,
    metrics,
    await organizationMinGroupSize(req.auth.organizationId),
    reportTeamScope(req),
  );
  res.json({ ...result, data: result });
});

export const download = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const query = req.validatedQuery as { period: string; metrics: string[]; format: "csv" | "pdf" };
  if (!query.format) throw new Error("Missing report format");
  const currentSubscription = await activeReportSubscription(req.auth.userId, req.auth.organizationId);
  const teamId = reportTeamScope(req);
  const file = await exportReport(
    req.auth.organizationId,
    currentSubscription,
    query.period,
    query.metrics,
    query.format,
    await organizationMinGroupSize(req.auth.organizationId),
    teamId,
  );
  res.setHeader("Content-Type", file.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
  res.setHeader("Cache-Control", "no-store");
  res.send(file.content);
});

export const generate = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const { period, metrics, format } = req.body as { period: string; metrics: string[]; format: "csv" | "pdf" };
  const currentSubscription = await activeReportSubscription(req.auth.userId, req.auth.organizationId);
  const teamId = reportTeamScope(req);
  const file = await exportReport(
    req.auth.organizationId,
    currentSubscription,
    period,
    metrics,
    format,
    await organizationMinGroupSize(req.auth.organizationId),
    teamId,
  );
  const report = await GeneratedReport.create({
    organizationId: req.auth.organizationId,
    teamId: teamId ?? null,
    createdBy: req.auth.userId,
    period,
    metrics,
    format,
    contentType: file.contentType,
    filename: file.filename,
    content: Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content),
    expiresAt: new Date(Date.now() + 30 * 86_400_000),
  });
  res.status(201).json({
    report: {
      id: report._id.toString(),
      period,
      metrics,
      format,
      filename: report.filename,
      createdAt: report.createdAt,
      expiresAt: report.expiresAt,
      downloadUrl: `/api/v1/reports/${report._id.toString()}`,
    },
  });
});

export const downloadGenerated = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  await activeReportSubscription(req.auth.userId, req.auth.organizationId);
  const teamId = reportTeamScope(req);
  const report = await GeneratedReport.findOne({
    _id: req.params.reportId,
    organizationId: req.auth.organizationId,
    ...(req.auth.role === "manager" ? { teamId } : {}),
    expiresAt: { $gt: new Date() },
  }).select("+content");
  if (!report) throw notFound("Report not found");
  const requestedFormat = req.validatedQuery as { format?: "pdf" | "csv" } | undefined;
  if (requestedFormat?.format && requestedFormat.format !== report.format) {
    throw badRequest("Requested format does not match the generated report");
  }
  res.setHeader("Content-Type", report.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${report.filename}"`);
  res.setHeader("Cache-Control", "no-store");
  res.send(report.content);
});
