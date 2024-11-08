type LogLevel = "debug" | "info" | "warn" | "error";

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getLogLevel = (): LogLevel => {
  const envLogLevel = process.env.LOG_LEVEL as LogLevel;
  if (envLogLevel && logLevels.hasOwnProperty(envLogLevel)) {
    return envLogLevel;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
};

const currentLogLevel = getLogLevel();

export const logger = {
  debug: (...args: any[]) => {
    if (logLevels[currentLogLevel] <= logLevels.debug) {
      console.log("[DEBUG]", ...args);
    }
  },
  info: (...args: any[]) => {
    if (logLevels[currentLogLevel] <= logLevels.info) {
      console.log("[INFO]", ...args);
    }
  },
  warn: (...args: any[]) => {
    if (logLevels[currentLogLevel] <= logLevels.warn) {
      console.log("[WARN]", ...args);
    }
  },
  error: (...args: any[]) => {
    if (logLevels[currentLogLevel] <= logLevels.error) {
      console.log("[ERROR]", ...args);
    }
  },
};
