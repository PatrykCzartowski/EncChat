import { useState } from "react";
import { useAuth } from "../../../Auth/AuthProvider";
import { Link } from "react-router-dom";
import Styles from "./LoginForm.module.css";
import SHA256 from "crypto-js/sha256";

export default function LoginForm({ handleSignUpButton }) {
 
  const [input, setInput] = useState({
    username: "",
    password: "",
    usernameIsEmail: false,
  });

  const isEmail = (username) => {
    return /\S+@\S+\.\S+/.test(username);
  }

  const auth = useAuth();

  const handleSubmitEvent = async (event) => {
    event.preventDefault();
    if(input.username !== "" && input.password !== "") {
      const hashedPassword = SHA256(input.password).toString();
      const usernameIsEmail = isEmail(input.username);
      auth.loginAction({ ...input, password: hashedPassword, usernameIsEmail });
      return;
    }
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className={Styles.loginForm}>
      <h2>Login</h2>
      <hr className={Styles.line} />
      <form onSubmit={handleSubmitEvent}>
        <label>Username</label>
        <input
          id="username"
          name="username"
          type="text"
          className={Styles.loginInput}
          placeholder="Enter your username"
          onChange={handleInput}
        />
        <label>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className={Styles.loginInput}
          placeholder="Enter your password"
          onChange={handleInput}
        />
        <Link to="/forgot-password" state={{ checkVal: true }}>
          Forgot password?
        </Link>
        <button className={Styles.buttonLoginForm} type="submit">Login</button>
        <p>or</p>
        <button className={Styles.buttonLoginForm} type="button" onClick={() => handleSignUpButton(true)}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
