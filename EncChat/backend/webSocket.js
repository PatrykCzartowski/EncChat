import { WebSocketServer } from "ws";
import { createWebSocketSession, deleteWebSocketSession } from "../backend/models/WebSocketSessionModel.js";

const clients = {};

export const setupWebSocket = (server) => {
  const wsServer = new WebSocketServer({ server });

  wsServer.on("connection", async (connection) => {
    const userId = uuidv4();
    console.log(`New connection: ${userId}`);
    clients[userId] = connection;

    connection.on("message", async (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === "CONNECT") {
          const { accountId } = data.payload;
          await createWebSocketSession(accountId, userId);
        }

        // Handle other message types...

      } catch (error) {
        console.error("WebSocket error:", error);
        connection.send(JSON.stringify({ error: "Internal server error" }));
      }
    });

    connection.on("close", async () => {
      console.log(`Connection closed: ${userId}`);
      await deleteWebSocketSession(userId);
      delete clients[userId];
    });
  });

  return wsServer;
};
