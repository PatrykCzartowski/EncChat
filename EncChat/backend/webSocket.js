import { WebSocketServer } from "ws";
import { createSession, getSessionId, deleteSession } from "./controllers/webSocketSessionController.js";
import { sendMessage } from "./controllers/chatController.js";
import { addFriend } from "./controllers/friendController.js";
import { sendFriendRequest, handleAcceptFriendRequest } from "./controllers/friendRequestController.js";
import { v4 as uuidv4 } from "uuid";
import logger from "./utils/logger.js";

const clients = {};

const sendToClient = (clientId, message) => {
  const client = clients[clientId];
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
};

const handleFriendRequest = async (data, connection) => {
  const { senderId, receiverId } = data.payload;
  const receiverWsSessionTokens = await getSessionId(receiverId);

  await sendFriendRequest(senderId, receiverId);

  receiverWsSessionTokens.forEach((sessionToken) => {
    if (clients[sessionToken]) {
      sendToClient(sessionToken, {
        type: "FRIEND_REQUEST",
        payload: { senderId },
      });
    }
  });

  logger.info(`Friend request sent from ${senderId} to ${receiverId}`);
};

const handleFriendRequestAcceptance = async (data, connection) => {
  const { requestId, accountId, friendId, senderId } = data.payload;

  try {
    await handleAcceptFriendRequest(requestId);
    await addFriend(accountId, friendId);

    sendToClient(accountId, {
      type: "FRIEND_REQUEST_ACCEPTED",
      payload: { accountId },
    });
    logger.info(`Friend request accepted by ${accountId} from ${senderId}`);

    sendToClient(friendId, {
      type: "FRIEND_CREATED",
      payload: { accountId, friendId },
    });
    logger.info(`Friend created between ${accountId} and ${friendId}`);
  } catch (error) {
    logger.error("Error handling friend request acceptance: ", error);
    connection.send(JSON.stringify({ success: false, error: "Internal server error" }));
  }
};

const handleNewMessage = async (data) => {
  const { payload } = data;
  await sendMessage(payload);

  Object.values(clients).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "NEW_MESSAGE",
        payload: data,
      }));
    }
  });
};

const handleConnect = async (data, userId) => {
  const accId = data.payload.accountId;
  console.log(accId)
  console.log(data)
  await createSession(accId, userId);
};

export const setupWebSocket = (server) => {
  const wsServer = new WebSocketServer({ server });

  wsServer.on("connection", async (connection) => {
    const userId = uuidv4();
    logger.info(`New connection: ${userId}`);
    clients[userId] = connection;

    connection.on("message", async (message) => {
      logger.debug(`Received message ${message}`);
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case "SEND_FRIEND_REQUEST":
            await handleFriendRequest(data, connection);
            logger.info(`Friend request sent from ${data.payload.senderId} to ${data.payload.receiverId}`);
            break;

          case "FRIEND_REQUEST_ACCEPTED":
            await handleFriendRequestAcceptance(data, connection);
            logger.info(`Friend request accepted by ${data.payload.accountId} from ${data.payload.senderId}`);
            break;

          case "NEW_MESSAGE":
            await handleNewMessage(data);
            logger.info(`New message received from: ${data.payload.authorId}`);
            break;

          case "CONNECT":
            console.log(data)
            await handleConnect(data, userId);
            logger.info(`User connected: ${data.payload.accountId}`);
            break;

          default:
            logger.warn(`Unknown message type: ${data.type}`);
            break;
        }
      } catch (error) {
        logger.error(`Error handling message: ${error}`);
        connection.send(JSON.stringify({ success: false, error: "Invalid message format" }));
      }
    });

    connection.on("close", async () => {
      logger.info(`Connection closed: ${userId}`);
      await deleteSession(userId);
      delete clients[userId];
    });
  });

  return wsServer;
};

process.on("SIGINT", () => {
  logger.warn("============== SERVER SHUTDOWN ==============");
  process.exit(0);
});