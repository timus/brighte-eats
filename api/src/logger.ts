import pino from "pino"

const isTest = process.env.NODE_ENV === "test"
const isDev = process.env.NODE_ENV !== "production"

export const logger = pino({
  level: isTest ? "silent" : "info",
  transport:
    isDev && !isTest
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
        }
      : undefined,
})
