import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import cors from "cors";

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

app.post("/api/accounts", async (req, res) => {
  console.log("Request body:", req.body);
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

app.put("/api/accounts/account/:username/:password/:email", async (req, res) => {
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
