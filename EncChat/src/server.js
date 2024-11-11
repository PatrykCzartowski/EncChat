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

app.post("/api/accounts/account", async (req, res) => {
  console.log("Login validation request")
  const { username, password, usernameIsEmail } = req.body;
  console.log("-> Request body:", req.body);
  try {
    const result = await pool.query(
      "SELECT username, password, email, is_email_verified FROM accounts WHERE username=$1 AND password=$2",
      [username, password]
    );
    const data = result.rows[0];
    console.log("-> Login data: ", data);
    if(data.is_email_verified) {
      if (usernameIsEmail) {
        if(username === data.email && password === data.password){
          console.log("-> usernameIsEmail: true");
          console.log("-> username Checked: OK");

          const updateLastLogin = await pool.query(
            "UPDATE accounts SET last_login = NOW() WHERE username=$1 AND password=$2 RETURNING *",
            [data.username, data.password]
          );
          console.log("-> Last login updated: ", updateLastLogin.rows[0]);

          return res.status(200).json({ isUserValid: true, user: updateLastLogin.rows[0] });
        } else {
          console.log("-> usernameIsEmail true");
          console.log("-> username Checked: NOT OK");
          return res.status(200).json({ isUserValid: false });
        }
      } else {
        if(username === data.username && password === data.password){
          console.log("-> usernameIsEmail: false");
          console.log("-> username Checked: OK");

          const updateLastLogin = await pool.query(
            "UPDATE accounts SET last_login = NOW() WHERE username=$1 AND password=$2 RETURNING *",
            [data.username, data.password]
          );
          console.log("-> Last login date updated to ", updateLastLogin.rows[0].last_login);

          return res.status(200).json({ isUserValid: true });
        } else {
          console.log("-> usernameIsEmail false");
          console.log("-> username Checked: NOT OK");
          return res.status(200).json({ isUserValid: false });
        }
      }
    } else {
      console.log("-> Email not verified");
      return res.status(200).json({ emailNotVerified: true });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
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
