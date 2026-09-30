import pino from "pino";

export function createLogger(context?: Record<string, unknown>): pino.Logger {
  const base = pino(
    process.env.NODE_ENV === "development"
      ? { transport: { target: "pino-pretty" } }
      : { level: process.env.NODE_ENV === "test" ? "silent" : "info" },
  );
  return context ? base.child(context) : base;
}
