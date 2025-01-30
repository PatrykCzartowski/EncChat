import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = "logs";
if(!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toLocaleUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({ level: "debug" }),
        new winston.transports.File({ filename: path.join(logDir, "server.log"), level: "info" }),
        new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" })
    ]
});

export default logger;