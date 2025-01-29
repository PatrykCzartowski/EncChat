import express from "express";
import http from "http";
import { setupWebSocket } from "./webSocket.js";
import accountRoutes from "./routes/accountRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";

const app = express();
const port = process.env.PORT || 5000;
const wsPort = process.env.WS_PORT || 8080;

const server = http.createServer(app);

setupWebSocket(server);

server.listen(wsPort, () => {
  console.log(`WebSocket server running on port ${wsPort}`);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use(express.json());
app.use("/api/account", accountRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/friend", friendRoutes);