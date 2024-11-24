import express from "express";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import ws from "ws";
import cors from "cors";
import jwt from "jsonwebtoken";

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
import { findAccount, createAccount, updateAccount, deleteAccount, getAccounts, } from "./models/AccountModel.js";
import { getProfile, updateProfile, } from "./models/ProfileModel.js";
import { getFriends, getFriendProfile, } from "./models/FriendModel.js";
import { getChats, getChatMessages, createMessage, createChat, } from "./models/ChatModel.js";

const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  return jwt.sign({ sub: user.id, iat: timestamp }, process.env.JWT_SECRET);
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post("/api/auth/login", async (req, res) => {
  const accountData = req.body;
  try {
    const account = await findAccount(accountData);
    if(account) return res.json({account,token: tokenForUser(accountData)});
  } catch (error) {
    console.error("Error finding account:", error);
  }
});

//Get profile data for logged user
app.post("/api/account/get_profile", async (req, res) => {
  try {
    const accountID = req.body.id;
    const profile = await getProfile(accountID);
    if(profile) return res.json(profile);
  } catch(error) {
    console.error("Error getting profile:", error);
  }
});

//Get list of friends for logged user
app.post("/api/account/get_friends", async (req, res) => {
  try {
    const accountID = req.body.id;
    const friends = await getFriends(accountID);
    if(friends) return res.json(friends);
  } catch (error) {
    console.error("Error getting friends:", error);
  }
});

//Get friend profile data for logged user
app.post("/api/account/get_friend_profile", async (req, res) => {
  try {
    const friendID = req.body.id;
    const profile = await getFriendProfile(friendID);
    if(profile) return res.json(profile);
  } catch(error) {
    console.error("Error getting friend profile:", error);
  }
});

//Get list of chats for logged user
app.post("/api/account/get_chats", async (req, res) => {
  try {
    const accountID = req.body.id;
    const chats = await getChats(accountID);
    if(chats) return res.json(chats);
  } catch (error) {
    console.error("Error getting chats:", error);
  }
});

//Get list of messages for chat
app.post("/api/account/get_chat_messages", async (req, res) => {
  try {
    const chatID = req.body.id;
    const messages = await getChatMessages(chatID);
    if(messages) return res.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
// ↑↑↑↑↑ SERVER PART ↑↑↑↑↑

export default prisma;
