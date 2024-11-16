import { useState } from "react";
import { Link } from "react-router-dom";
import Styles from "./LoginForm.module.css";
import SHA256 from "crypto-js/sha256";
import ReCAPTCHA from "react-google-recaptcha";

export default function LoginForm({ handleSignUpButton }) {
  const [captchaToken, setCaptchaToken] = useState(null);
  const processLogin = (event) => {
    event.preventDefault();
    console.log("Login form submitted");
    const username = event.target[0].value;
    const password = SHA256(event.target[1].value).toString();
    const usernameIsEmail = username.includes("@");
    const loginData = {
      username: username,
      password: password,
      usernameIsEmail: usernameIsEmail,
      captchaToken: captchaToken,
    };
    console.log(loginData);
  };

  return (
    <div className={Styles.login_form}>
      <h2>Login</h2>
      <hr className={Styles.line} />
      <form onSubmit={processLogin}>
        <label>Username</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username"
        />
        <label>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
        />
        <Link to="/forgot-password" state={{ checkVal: true }}>
          Forgot password?
        </Link>
        <div className={Styles.captcha_container}>
          <ReCAPTCHA
            sitekey="6LdSa2UqAAAAAH_dvmyJH3p5koMR8l5LWL2eZHjD"
            onChange={(token) => setCaptchaToken(token)}
          />
        </div>
        <button type="submit">Login</button>
        <p>or</p>
        <button type="button" onClick={() => handleSignUpButton(true)}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
