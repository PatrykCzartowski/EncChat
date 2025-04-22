import { WebSocketServer } from "ws";
import { createWebSocketSession, getSessionIdByAccountId, deleteWebSocketSession } from "./models/WebSocketSessionModel.js";
import { sendMessage } from "./controllers/chatController.js";
import { sendFriendRequest } from "./controllers/friendRequestController.js";
import { acceptFriendRequest } from "./models/FriendRequestModel.js";
import { createFriend, removeFriend } from "./models/FriendModel.js";
import { createBlockedUser, deleteBlockedUser } from './models/BlockedUserModel.js';
import { v4 as uuidv4 } from "uuid";
import logger from "./utils/logger.js";

const clients = {};
const clientsKeys = {};

const sendToClient = (clientId, message) => {
  const client = clients[clientId];
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
};

const handleFriendRemoval = async (data) => {
  const { userId, friendId } = data.payload;

  try {
    await removeFriend(userId, friendId);
    const friendSessions = await getSessionIdByAccountId(friendId);

    friendSessions.forEach((sessionToken) => {
      if(clients[sessionToken]) {
        sendToClient(sessionToken, {
          type: 'FRIEND_REMOVED',
          payload: {
            removedBy: userId,
            friendId: friendId,
          }
        });
      }
    });

    const userSessions = await getSessionIdByAccountId(userId);
    userSessions.forEach((sessionToken) => {
      if(clients[sessionToken]) {
        sendToClient(sessionToken, {
          type: "FRIEND_REMOVAL_SUCCESSFUL",
          payload: {
            removedFriendId: friendId,
          }
        });
      }
    });

    logger.info(`Friend ${friendId} removed by user ${userId}`);
  } catch (error) {
    logger.error("Error handling friend removal: ", error);
  }
};

const handleUserBlocking = async (data) => {
  const { blockerId, blockedId } = data.payload;

  try {
    await removeFriend(blockerId, blockedId);
    await createBlockedUser(blockerId, blockedId);

    const blockerSessions = await getSessionIdByAccountId(blockerId);

    blockerSessions.forEach((sessionToken) => {
      if(clients[sessionToken]) {
        sendToClient(sessionToken, {
          type: "USER_BLOCKED_SUCCESSFULLY",
          payload: {
            blockedId: blockedId,
          }
        });
      }
    });

    logger.info(`User ${blockedId} blocked by ${blockerId}`);
  } catch (error) {
    logger.error("Error handling user blocking: ", error);
  }
};

const handleUserUnblocking = async (data) => {
  const { userId, blockedId } = data.payload;
  
  try {
    // Unblock the user
    await deleteBlockedUser(userId, blockedId);
    
    // Notify the user who unblocked
    const unblockerSessions = await getSessionIdByAccountId(userId);
    
    unblockerSessions.forEach((sessionToken) => {
      if (clients[sessionToken]) {
        sendToClient(sessionToken, {
          type: "USER_UNBLOCKED_SUCCESSFULLY",
          payload: {
            unblockedId: blockedId
          }
        });
      }
    });
    
    logger.info(`User ${blockedId} unblocked by ${userId}`);
  } catch (error) {
    logger.error("Error handling user unblocking:", error);
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
  logger.debug(`handleNewMessage -> New message received from user: ${payload.authorId} for chat: ${payload.chatId}`);
  
  try {
    await sendMessage(payload);

    Object.values(clients).forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
              type: "NEW_MESSAGE",
              payload: {
                  payload
              }
          }));
      }
    });
  } catch(error) {
    logger.error(`Error in handleNewMessage: ${error.message}`);
  }
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
  const { targetUserId, chatId, encryptedSymmetricKey } = data.payload;

  const targetSessions = await getSessionIdByAccountId(targetUserId);

  targetSessions.forEach((sessionToken) => {
    if(clients[sessionToken]) {
      sendToClient(sessionToken, {
        type: "KEY_EXCHANGE",
        payload: {
          senderId: clientsKeys[userId].accountId,
          chatId: chatId,
          encryptedSymmetricKey: encryptedSymmetricKey
        }
      });
    }
  });

  logger.info(`Key exchange initiated between ${clientsKeys[userId].accountId} and ${targetUserId} for chat ${chatId}`);
}

const handleKeyRequest = async (data, userId, connection) => {
  const { chatId, requesterId } = data.payload;
  
  const requesterSessions = await getSessionIdByAccountId(requesterId);
  
  requesterSessions.forEach((sessionToken) => {
    if(clients[sessionToken]) {
      sendToClient(sessionToken, {
        type: "REQUEST_KEY",
        payload: {
          senderId: clientsKeys[userId].accountId,
          chatId
        }
      });
    }
  });
  
  logger.info(`Key requested by ${requesterId} for chat ${chatId}`);
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
          case "REMOVE_FRIEND":
            await handleFriendRemoval(data);
            logger.info(`Friend removal initiated by ${clientsKeys[userId]?.accountId}`);
            break;
          case "BLOCK_USER":
            await handleUserBlocking(data);
            logger.info(`User blocking initiated by ${clientsKeys[userId]?.accountId}`);
            break;
          case "UNBLOCK_USER":
            await handleUserUnblocking(data);
            logger.info(`User unblocking initiated by ${clientsKeys[userId]?.accountId}`);
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

          case "KEY_EXCHANGE":
            await handleKeyExchange(data, userId, connection);
            logger.info(`Key exchange initiated between ${clientsKeys[userId].accountId} and ${data.payload.targetUserId}`);
            break;
          case "REQUEST_KEY":
            await handleKeyRequest(data, userId, connection);
            logger.info(`Key requested for chat: ${data.payload.chatId}`);
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