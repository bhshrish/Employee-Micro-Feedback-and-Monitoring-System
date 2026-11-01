import pino from "pino";
import { getConfig } from "../config/env";

export const logger = pino({
  level: getConfig().LOG_LEVEL,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "req.body", "res.headers['set-cookie']"],
    censor: "[REDACTED]",
  },
});
