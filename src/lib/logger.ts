import winston from "winston";

export const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toLocaleString(),
    }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return `\n${timestamp}\n[${level}] -> ${message}\n${
        Object.keys(meta).length ? `${JSON.stringify(meta, null, 2)}` : ""
      }`;
    })
  ),
  transports: [new winston.transports.Console()],
});
