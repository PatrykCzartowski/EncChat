import express from "express";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import ws from "ws";
import cors from "cors";

import { findAccount } from "./models/AccountModel.js";

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

const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  return jwt.encode({sub: user.id, iat: timestamp}, process.env.JWT_SECRET);
}

app.post("/api/auth/login", async (req, res) => {
  const accountData = req.body;
  try {
    const result = await findAccount(accountData);
    if(result) {
      res.json({token: tokenForUser(accountData)});
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error("Error finding account:", error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

