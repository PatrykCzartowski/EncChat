import { useState } from "react";
import { useAuth } from "../../../Auth/AuthProvider/AuthProvider";
import { Link } from "react-router-dom";

import "./LoginForm.module.css";

import SHA256 from "crypto-js/sha256";
import ReCAPTCHA from "react-google-recaptcha";

export default function LoginForm({ handleSignUpButton }) {
  const [captchaToken, setCaptchaToken] = useState(null);
  
  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const auth = useAuth();

  const handleSubmitEvent = (event) => {
    event.preventDefault();
    if(input.username !== "" && input.password !== "") {
      input.password = SHA256(input.password).toString();
      auth.loginAction(input);
      return;
    }
    alert("Please fill in all fields");
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="login_form">
      <h2>Login</h2>
      <form onSubmit={handleSubmitEvent}>
        <label>Username</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username"
          onChange={handleInput}
        />
        <label>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          onChange={handleInput}
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
