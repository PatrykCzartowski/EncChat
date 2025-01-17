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
import axios from "axios";

import {v2 as cloudinary} from "cloudinary";
import multer from "multer";
import streamifier from 'streamifier';

const storage = multer.memoryStorage();
const upload = multer({ storage });

dotenv.config();
neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json({ limit: '10mb' }));

cloudinary.config({
  cloud_name: 'dbkxyl7rl',
  api_key: '369238514974488',
  api_secret: '75xQbruIPCdgcv-3ZIIhs-qA6wc'
});

// TRANSFER PART BELOW TO SERVER.JS LATER
// ↓↓↓↓↓ SERVER PART ↓↓↓↓↓
import { findAccount, createAccount, updateAccount, verifyEmailAddress, updateAccountPassword } from "./models/AccountModel.js";
import { getProfile, updateProfile, findProfileLike, } from "./models/ProfileModel.js";
import { getFriends, getFriendProfile, createFriend, } from "./models/FriendModel.js";
import { getChatsList, getChatData, getChatMessages, getChatAccounts, getAggregatedChatData, createMessage, createChat, } from "./models/ChatModel.js";
import { createFriendRequest, getFriendRequests, acceptFriendRequest, declineFriendRequest, } from "./models/FriendRequestModel.js";
import { createWebSocketSession, getSessionIdByAccountId, deleteWebSocketSession } from "./models/WebSocketSessionModel.js";
import { profile } from "console";

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
  clients[userId].send(
    JSON.stringify({ type: "CONNECTED", payload: { userId } })
  )
  connection.on("message", async (message) => {
    console.log(`Received message ${message}`);
    try {
      const data = JSON.parse(message);

      if (data.type === "SEND_FRIEND_REQUEST") {
        const { senderId, receiverId, senderWsClientId } = data.payload;
        const receiverWsSessionTokens = await getSessionIdByAccountId(receiverId);
        const result = await createFriendRequest(senderId, receiverId);
        Object.entries(clients).forEach(([clientId, clientConnection]) => {
          if(receiverWsSessionTokens.find((sessionToken) => sessionToken === clientId) && clientConnection.readyState === WebSocket.OPEN) {
            clientConnection.send(
              JSON.stringify({
                type: "FRIEND_REQUEST",
                payload: { senderId },
              })
            );
          }
        })
        console.log(`Friend request sent from ${senderId} to ${receiverId}`);
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
      } else if (data.type === "CONNECT") {
        const accountId = data.payload.accountId;
        const result = await createWebSocketSession(accountId, userId);
      }
    } catch (error) {
      console.error("Error creating message: ", error);
      connection.send(JSON.stringify({ success: false, error }));
    }
  });

  connection.on("close", async () => {
    console.log(`${userId} disconnected.`);
    await deleteWebSocketSession(userId);
    delete clients[userId];
  });
});

server.listen(wsPort, () => {
  console.log(`WebSocket server running on port ${wsPort}`);
});

//---->WEB SOCKET SERVER<----//

app.post('/api/verify_recaptcha', async (req, res) => {
  const { token } = req.body;
  const secretKey = '6LepW7gqAAAAANjzcVSUUqLK5xs429qZm2jaEk7c';
  try {
  const response = await axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    null,
    {
      params: {
        secret: secretKey,
        response: token,
      },
    }
  )
  if (response.data.success) { res.status(200).send({ success: true }) } 
  else { res.status(400).send({ success: false, error: response.data['error-codes'] }) }
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }

});

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

app.post("/api/account/create_profile",async (req, res) => {
  try {
    console.log(req.body);
    const { accountId, avatar, firstName, lastName, bio } = req.body;
    
    console.log('accountId: ', accountId);
    console.log('firstName: ', firstName);
    console.log('lastName: ', lastName);

    let avatarUrl = null;
    if(avatar) {
      const uploadResult = await cloudinary.uploader.upload(avatar, {
        folder: 'avatars',
      });
      avatarUrl = uploadResult.secure_url;
    }

    const profileData = {
      avatar: avatarUrl,
      firstName,
      lastName,
      bio,
    }

    const profile = await updateProfile(parseInt(accountId), profileData);
    console.log('profile created: ', profileData);
    res.json({ success: true, profile: profileData });
  } catch (error) {
    console.error("Error creating profile: ", error);
    res.status(500).json({ success: false, error: 'internal server error' });
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

app.post("/api/session/get_session_id_by_account_id", async (req, res) => {
  try {
    const accountId = req.body.id;
    const result = await getSessionIdByAccountId(accountId);
    return res.json(result);
  } catch (error) {
    console.error("Error getting session ID: ", error);
  }
});
// ↑↑↑↑↑ SERVER PART ↑↑↑↑↑

export default prisma;
