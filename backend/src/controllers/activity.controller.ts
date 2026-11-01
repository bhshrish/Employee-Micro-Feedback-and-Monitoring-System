import { asyncHandler } from "../utils/async-handler";
import * as activity from "../services/activity.service";
import { unauthorized } from "../utils/errors";

export const dashboard = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const query = req.validatedQuery as { range: string };
  res.json(await activity.dashboard(req.auth.userId, req.auth.organizationId, query.range));
});

export const start = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const session = await activity.startActivity(req.auth, req.body);
  res.status(201).json({ session });
});

export const heartbeat = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const sessionId = req.params.sessionId ?? req.body?.sessionId;
  const session = await activity.heartbeatActivity(req.auth.userId, req.auth.organizationId, sessionId);
  res.json({ session });
});

export const idle = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const session = await activity.setActivityIdle(
    req.auth.userId,
    req.auth.organizationId,
    req.params.sessionId,
    req.body.idle,
  );
  res.json({ session });
});

export const tags = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const session = await activity.setActivityTags(
    req.auth.userId,
    req.auth.organizationId,
    req.params.sessionId,
    req.body,
  );
  res.json({ session });
});

export const history = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const query = req.validatedQuery as { page: number; limit: number; from?: string; to?: string };
  const result = await activity.activityHistory(req.auth.userId, req.auth.organizationId, query);
  res.json({ ...result, data: result });
});

export const summary = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const query = req.validatedQuery as { range: string };
  const dashboard = await activity.dashboard(req.auth.userId, req.auth.organizationId, query.range);
  res.json({ range: dashboard.range, summary: dashboard.summary });
});

export const pause = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const session = await activity.pauseActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId);
  res.json({ session });
});

export const resume = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const session = await activity.resumeActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId);
  res.json({ session });
});

export const stop = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const session = await activity.finishActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId);
  res.json({ session });
});
