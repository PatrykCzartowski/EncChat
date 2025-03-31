import express from "express";
import http from "http";
import { setupWebSocket } from "./webSocket.js";
import accountRoutes from "./routes/accountRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import friendRequestRoutes from "./routes/friendRequestRoutes.js";
import webSocketSessionRoutes from "./routes/webSocketSessionRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import userKeysRoutes from "./routes/userKeysRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";
import logger from "./utils/logger.js";

const app = express();
const port = process.env.PORT || 5000;
const wsPort = process.env.WS_PORT || 8080;

const server = http.createServer(app);

setupWebSocket(server);

server.listen(wsPort, () => {
  logger.warn("============== SERVER RUNNING ==============");
  logger.info(`Websocket server running on port ${wsPort}`);
});

app.listen(port, () => {
  logger.info(`Node.js server running on port ${port}`);
});

app.use(express.json({ limit: '10mb' }));
app.use("/api/account", accountRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/friendRequest", friendRequestRoutes);
app.use("/api/webSocketSession", webSocketSessionRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/userKeys", userKeysRoutes);
app.use("/api/backups", backupRoutes);

const shutdownHandler = () => {
  logger.warn("============== SERVER SHUTDOWN INITIATED ==============");

  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdownHandler);
process.on("SIGTERM", shutdownHandler);
