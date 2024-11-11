import { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginForm.module.css";
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
    validateLogin(loginData);
  };

  const validateLogin = async (loginData) => {
    try {
      const response = await fetch("/api/accounts/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      if (response.ok) {
        const result = await response.json();
        if(result.emailNotVerified) {
          console.log("Email not verified");
        } else {
          if(result.isUserValid){
            console.log("Login successful");
          } else {
            console.log("Login failed");
          }
        }
      } else {
        const errorData = await response.json();
        console.error("Error validating login: ", errorData);
      }
    } catch(error) {
      console.error("Error validating login: ", error);
    }
  };

  return (
    <div className="login_form">
      <h2>Login</h2>
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
        <div>
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
