import { WebSocketServer } from "ws";
import { createWebSocketSession, getSessionIdByAccountId, deleteWebSocketSession } from "./models/WebSocketSessionModel.js";
import { sendMessage } from "./controllers/chatController.js";
import { sendFriendRequest, handleAcceptFriendRequest } from "./controllers/friendRequestController.js";
import { acceptFriendRequest } from "./models/FriendRequestModel.js";
import { createFriend } from "./models/FriendModel.js";
import { v4 as uuidv4 } from "uuid";
import logger from "./utils/logger.js";
import { encryptMessage, decryptMessage } from "./utils/encryption.js";

const clients = {};
const clientsKeys = {};

const sendToClient = (clientId, message) => {
  const client = clients[clientId];
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
};

const handleFriendRequest = async (data, connection) => {
  const { senderId, receiverId } = data.payload;
  const receiverWsSessionTokens = await getSessionIdByAccountId(receiverId);

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
  const { requestId, friendId, accountId, senderId } = data.payload;

  try {
    await acceptFriendRequest(requestId);
    await createFriend(accountId, friendId);

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

// To be changed to encrypt E2E for each recipient separately
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
  const accountId = data.payload.accountId;
  await createWebSocketSession(accountId, userId);

  if(data.payload.publicKey) {
    clientsKeys[userId] = {
      accountId,
      publicKey: data.payload.publicKey
    };
    logger.info(`Stored public key for user: ${accountId}`);
  }
};

const handleKeyExchange = async (data, userId, connection) => {
  const { targetUserId, encryptSymmetricKey } = data.payload;

  const targetSessions = await getSessionIdByAccountId(targetUserId);

  targetSessions.forEach((sessionToken) => {
    if(clients[sessionId]) {
      sendToClient(sessionId, {
        type: "KEY_EXCHANGE",
        payload: {
          senderId: clientsKeys[userId].accountId,
          encryptSymmetricKey
        }
      });
    }
  });

  logger.info(`Key exchange initiated between ${clientsKeys[userId].accountId} and ${targetUserId}`);
}

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
            console.log(data);
            await handleFriendRequest(data, connection);
            logger.info(`Friend request sent from ${data.payload.senderId} to ${data.payload.receiverId}`);
            break;

          case "FRIEND_REQUEST_ACCEPTED":
            await handleFriendRequestAcceptance(data, connection);
            console.log(data.payload);
            logger.info(`Friend request accepted by ${data.payload.accountId} from ${data.payload.senderId}`);
            break;

          case "NEW_MESSAGE":
            await handleNewMessage(data);
            logger.info(`New message received from: ${data.payload.authorId}`);
            break;

          case "CONNECT":
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
      await deleteWebSocketSession(userId);
      delete clients[userId];
    });
  });

  return wsServer;
};

process.on("SIGINT", () => {
  logger.warn("============== SERVER SHUTDOWN ==============");
  process.exit(0);
});