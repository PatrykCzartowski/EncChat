import { useEffect, useState } from "react";
import { useAuth } from "../../../Auth/AuthProvider";
import { Link } from "react-router-dom";

import Styles from "./LoginForm.module.css";

import SHA256 from "crypto-js/sha256";
import ReCAPTCHA from "react-google-recaptcha";


export default function LoginForm({ handleSignUpButton }) {
  const [captchaToken, setCaptchaToken] = useState(null);
  const siteKey = '6LepW7gqAAAAAIjKGm1-98cvEsq4xqra3S-uU1ks';

  const [input, setInput] = useState({
    username: "",
    password: "",
    usernameIsEmail: false,
  });

  const isEmail = (username) => {
    return /\S+@\S+\.\S+/.test(username);
  }

  const auth = useAuth();

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmitEvent = async (event) => {
    event.preventDefault();
    if(input.username !== "" && input.password !== "") {
      input.password = SHA256(input.password).toString();
      input.usernameIsEmail = isEmail(input.username);
      auth.loginAction(input);
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
    <div className={Styles.login_form}>
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
        <div className={Styles.captcha_container}>
          <ReCAPTCHA
            sitekey={siteKey}
            onChange={handleCaptchaChange}
            onExpired={() => setCaptchaToken(null)} // Reset token if expired
          />
        </div>
        <button className={Styles.buttonLoginForm} type="submit">Login</button>
        <p>or</p>
        <button className={Styles.buttonLoginForm} type="button" onClick={() => handleSignUpButton(true)}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
