import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jwt-simple";

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json());

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//ACCOUNTS
app.get("/api/accounts", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, password, email FROM accounts");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//LOGIN AUTHENTICATION
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  const tokenForUser = (user) => {
    const timestamp = new Date().getTime();
    return jwt.encode({sub: user.id, iat: timestamp}, process.env.JWT_SECRET);
  }

  try {
    const result = await pool.query(
      "SELECT * FROM accounts WHERE (username=$1 OR email=$1) AND password=$2",
      [username, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const user = result.rows[0];
    const token = tokenForUser(user);

    await pool.query(
      "UPDATE accounts SET last_login = NOW() WHERE id=$1",
      [user.id]
    );
    return res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET PROFILE
app.post('/api/user/profile', async (req, res) => {
  const { userID } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userID]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET FRIENDS ID
app.post('/api/user/friends', async (req, res) => {
  const { userID } = req.body;
  try {
    const result = await pool.query("SELECT friend_id FROM friends WHERE user_id = $1", [userID]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Friends not found" });
    }
    const friends = result.rows.map(friend => friend.friend_id);
    return res.json({ friends: friends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET FRIEND DATA
app.post('/api/user/friend/data', async (req, res) => {
  const { friendID } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [friendID]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Friends data not found" });
    }

    return res.json({ friendData: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET USER CHAT ID
app.post('/api/user/chat', async (req, res) => {
  const { userID, friendID } = req.body;
  try {
    const result = await pool.query("SELECT c.id FROM chats c JOIN chat_users cu1 ON c.id = cu1.chat_id JOIN chat_users cu2 ON c.id = cu2.chat_id WHERE cu1.user_id = $1 AND cu2.user_id = $2 AND NOT EXISTS ( SELECT 1 FROM chat_users cu_other WHERE cu_other.chat_id = c.id AND cu_other.user_id NOT IN ($1, $2)); ", [userID, friendID]);
    //if (result.rows.length === 0) {
    //  return res.status(404).json({ message: "Chat not found" });
    //}

    return res.json({ chatID: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET CHAT MESSAGES
app.post('/api/chat/messages', async (req, res) => {
  const { chatID } = req.body;
  try {
    const result = await pool.query("SELECT * FROM messages WHERE chat_id = $1", [chatID]);
    //if (result.rows.length === 0) {
    //  return res.status(404).json({ message: "Messages not found" });
    //}

    return res.json({ messages: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/accounts", async (req, res) => {
  const { username, password, email, dateOfBirth } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO accounts (username, password, email, date_of_birth) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, password, email, dateOfBirth]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/api/accounts/account/:username/:password/:email/", async (req, res) => {
  const { username, password, email } = req.params;

  try {
    const result = await pool.query(
      "UPDATE accounts SET is_email_verified = true WHERE username=$1 AND password=$2 AND email = $3 RETURNING *",
      [username, password, email]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
