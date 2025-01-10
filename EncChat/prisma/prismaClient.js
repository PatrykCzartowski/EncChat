import express from "express";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import ws from "ws";
import http from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// TRANSFER PART BELOW TO SERVER.JS LATER
// ↓↓↓↓↓ SERVER PART ↓↓↓↓↓
import {
  findAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccounts,
  verifyEmailAddress,
  updateAccountPassword,
} from "./models/AccountModel.js";
import {
  getProfile,
  updateProfile,
  findProfileLike,
} from "./models/ProfileModel.js";
import {
  getFriends,
  getFriendProfile,
  createFriend,
} from "./models/FriendModel.js";
import {
  getChatsList,
  getChatData,
  getChatMessages,
  getChatAccounts,
  getAggregatedChatData,
  createMessage,
  createChat,
} from "./models/ChatModel.js";
import {
  createFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
} from "./models/FriendRequestModel.js";

const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  return jwt.sign({ sub: user.id, iat: timestamp }, process.env.JWT_SECRET);
};

//---->WEB SOCKET SERVER<----//
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const wsPort = process.env.WS_PORT || 8080;
const clients = {};
wsServer.on("connection", function (connection) {
  const userId = uuidv4();
  console.log(`Received connection from ${userId}`);
  clients[userId] = connection;
  console.log(`${userId} connected.`);

  connection.on("message", async (message) => {
    console.log(`Received message ${message}`);
    try {
      const data = JSON.parse(message);

      if (data.type === "SEND_FRIEND_REQUEST") {
        const { senderId, receiverId } = data.payload;
        const result = await createFriendRequest(data.payload);
        if (
          clients[receiverId] &&
          clients[receiverId].readyState === WebSocket.OPEN
        ) {
          clients[receiverId].send(
            JSON.stringify({
              type: "FRIEND_REQUEST_RECEIVED",
              payload: { senderId },
            })
          );
          console.log(`Friend request sent from ${senderId} to ${receiverId}`);
        } else {
          console.log(
            `Friend request failed from ${senderId} to ${receiverId}`
          );
          connection.send(
            JSON.stringify({ success: false, error: "Receiver not connected" })
          );
        }
      } else if (data.type === "FRIEND_REQUEST_ACCEPTED") {
        const { requestId, accountId, friendId, senderId } = data.payload;
        console.log(
          `Friend request accepted: "requestId":${requestId} "accountId":${accountId} "friendId":${friendId}`
        );
        try{
          await acceptFriendRequest(requestId);
          await createFriend(accountId, friendId);
          if (clients[accountId] && clients[accountId].readyState === WebSocket.OPEN) {
            clients[accountId].send(
              JSON.stringify({
                type: "FRIEND_REQUEST_ACCEPTED",
                payload: { accountId },
              })
            );
            console.log(`Friend request accepted by ${accountId} from ${senderId}`);
          } else {
            console.log(`Friend request acceptance failed by ${accountId} from ${senderId}`);
            connection.send(
              JSON.stringify({ success: false, error: "Sender not connected" })
            );
          }
          if(clients[friendId] && clients[friendId].readyState === WebSocket.OPEN) {
            clients[friendId].send(
              JSON.stringify({
                type: "FRIEND_CREATED",
                payload: { accountId, friendId },
              })
            );
            console.log(`Friend created between ${accountId} and ${friendId}`);
          }
        } catch(error) {
          console.error("Error handling friend request acceptance: ", error);
          connection.send(
            JSON.stringify({ success: false, error: "Internal server error" })
          );
        }
      } else if (data.type === "NEW_MESSAGE") {
        const result = await createMessage(data.payload);

        Object.values(clients).forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "NEW_MESSAGE",
                payload: data,
              })
            );
          }
        });
      }
    } catch (error) {
      console.error("Error creating message: ", error);
      connection.send(JSON.stringify({ success: false, error }));
    }
  });

  connection.on("close", () => {
    console.log(`${userId} disconnected.`);
    delete clients[userId];
  });
});

server.listen(wsPort, () => {
  console.log(`WebSocket server running on port ${wsPort}`);
});

//---->WEB SOCKET SERVER<----//

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/auth/login", async (req, res) => {
  const accountData = req.body;
  try {
    const account = await findAccount(accountData);
    if (account) return res.json({ account, token: tokenForUser(accountData) });
  } catch (error) {
    console.error("Error finding account: ", error);
  }
});

//Get profile data for logged user
app.post("/api/account/get_profile", async (req, res) => {
  try {
    const accountID = req.body.id;
    const profile = await getProfile(accountID);
    if (profile) return res.json(profile);
  } catch (error) {
    console.error("Error getting profile: ", error);
  }
});

//Get list of friends for logged user
app.post("/api/account/get_friends", async (req, res) => {
  try {
    const accountID = req.body.id;
    const friends = await getFriends(accountID);
    if (friends) return res.json(friends);
  } catch (error) {
    console.error("Error getting friends: ", error);
  }
});

//Get friend profile data for logged user
app.post("/api/account/get_friend_profile", async (req, res) => {
  try {
    const friendID = req.body.id;
    const profile = await getFriendProfile(friendID);
    if (profile) return res.json(profile);
  } catch (error) {
    console.error("Error getting friend profile: ", error);
  }
});

//Get list of chats for logged user
app.post("/api/account/get_chats_list", async (req, res) => {
  try {
    const accountID = req.body.id;
    const chats = await getChatsList(accountID);
    if (chats) return res.json(chats);
  } catch (error) {
    console.error("Error getting chats: ", error);
  }
});

//Get chat data for chat
app.post("/api/account/get_chat_data", async (req, res) => {
  try {
    const chatID = req.body.id;
    const chatData = await getChatData(chatID);
    if (chatData) return res.json(chatData);
  } catch (error) {
    console.error("Error getting chat data: ", error);
  }
});

//Get list of messages for chat
app.post("/api/account/get_chat_messages", async (req, res) => {
  try {
    const chatID = req.body.id;
    const messages = await getChatMessages(chatID);
    if (messages) return res.json(messages);
  } catch (error) {
    console.error("Error getting messages: ", error);
  }
});

//Get list of accounts in chat
app.post("/api/account/get_chat_accounts", async (req, res) => {
  try {
    const chatID = req.body.id;
    const accounts = await getChatAccounts(chatID);
    if (accounts) return res.json(accounts);
  } catch (error) {
    console.error("Error getting accounts: ", error);
  }
});

app.post("/api/account/get_aggregated_chat_data", async (req, res) => {
  try {
    const accountID = req.body.id;
    const aggregateChatData = await getAggregatedChatData(accountID);
    if (aggregateChatData) return res.json(aggregateChatData);
  } catch (error) {
    console.error("Error getting aggregated chat data: ", error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.post("/api/account/create_new_account", async (req, res) => {
  {
    try {
      const signUpData = req.body.signUpData;
      const result = await createAccount(signUpData);
      if (result) return res.status(201);
    } catch (error) {
      console.error("Error creating new account: ", error);
    }
  }
});

app.post("/api/account/find_profile_like", async (req, res) => {
  try {
    const providedString = req.body.providedString;
    const profile = await findProfileLike(providedString);
    if (profile) return res.json(profile);
  } catch (error) {
    console.error("Error finding account like: ", error);
  }
});

app.post("/api/account/create_account", async (req, res) => {
  try {
    const accountData = req.body;
    const account = await createAccount(accountData);
    if (account) {
      console.log("Account created: ", account);
      return res.json(account);
    }
  } catch (error) {
    console.error("Error creating account: ", error);
  }
});

app.post("/api/account/verify_email", async (req, res) => {
  try {
    const accountData = req.body.signUpData;
    const emailVerif = await verifyEmailAddress(accountData);
    if (emailVerif) {
      console.log("Email verified: ", emailVerif);
      return res.json(emailVerif);
    }
  } catch (error) {
    console.error("Error verifying email: ", error);
  }
});

app.post("/api/account/create_profile", async (req, res) => {
  try {
    const { accountId, ProfileData } = req.body;
    const profile = await updateProfile(accountId, ProfileData);
    if (profile) return res.json(profile);
  } catch (error) {
    console.error("Error creating profile: ", error);
  }
});

app.post("/api/forgot_password/find_account", async (req, res) => {
  try {
    const accountData = req.body;
    const account = await findAccount(accountData);
    if (account) return res.json(account);
  } catch (error) {
    console.error("Error finding account: ", error);
  }
});

app.post("/api/forgot_password/change_password", async (req, res) => {
  try {
    const { accountId, newPassword } = req.body.data;
    const result = await updateAccountPassword(accountId, newPassword);
    if (result) return res.json(result);
  } catch (error) {
    console.error("Error changing password: ", error);
  }
});

app.post("/api/account/get_friend_requests", async (req, res) => {
  try {
    const accountId = req.body.id;
    const friendRequests = await getFriendRequests(accountId);
    if (friendRequests) return res.json(friendRequests);
  } catch (error) {
    console.error("Error getting friend requests: ", error);
  }
});

app.post("/api/account/accept_friend_request", async (req, res) => {
  try {
    const requestId = req.body.id;
    const result = await acceptFriendRequest(requestId);
    if (result) return res.json(result);
  } catch (error) {
    console.error("Error accepting friend request: ", error);
  }
});

app.post("/api/account/decline_friend_request", async (req, res) => {
  try {
    const requestId = req.body.id;
    const result = await declineFriendRequest(requestId);
    if (result) return res.json(result);
  } catch (error) {
    console.error("Error declining friend request: ", error);
  }
});

app.post("/api/account/create_friend", async (req, res) => {
  try {
    const { accountId, friendId } = req.body;
    const result = await createFriend(accountId, friendId);
    if (result) return res.json(result);
  } catch (error) {
    console.error("Error creating friend: ", error);
  }
});
// ↑↑↑↑↑ SERVER PART ↑↑↑↑↑

export default prisma;
