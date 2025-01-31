import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SHA256 from "crypto-js/sha256";
import Styles from "./SignUp.module.css";

export default function SignUpForm({ handleGoBack }) {
  const [captchaToken, setCaptchaToken] = useState(null);

  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [arePasswordsMatching, setArePasswordsMatching] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isDateValid, setIsDateValid] = useState(true);

  const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
  const numberPattern = /[0-9]/;
  const upperCasePattern = /[A-Z]/;
  const lowerCasePattern = /[a-z]/;

  const navigate = useNavigate();

  const processSignUp = async (event) => {
    const signUpData = {
      username: event.target[0].value,
      password: SHA256(event.target[1].value).toString(),
      email: event.target[3].value,
    };
        
    try {
      const response = await fetch("/api/account/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Account created: ", result);
        navigate("/email-verification", { state: { signUpData: signUpData } });
      } else {
        const errorData = await response.json();
        console.error("Error creating account: ", errorData);
      }
    } catch (error) {
      console.error("Error creating account: ", error);
    }
    
  };

  const validateUsername = (username) => {
    if (username.length < 6) {
      return false;
    }
    const usernameHasSpecialChars = specialCharPattern.test(username);
    setIsUsernameValid(!usernameHasSpecialChars);
    return !usernameHasSpecialChars;
  };

  const validatePassword = (password) => {
    const passwordHasSpecialChars = specialCharPattern.test(password);
    const passwordHasNumber = numberPattern.test(password);
    const passwordHasUpperCase = upperCasePattern.test(password);
    const passwordHasLowerCase = lowerCasePattern.test(password);
    const passwordIsValid =
      passwordHasSpecialChars &&
      passwordHasNumber &&
      passwordHasUpperCase &&
      passwordHasLowerCase;
    return passwordIsValid;
  };

  const validatePasswordMatch = (password, confirmPassword) => {
    const passwordsMatch = password === confirmPassword;
    return passwordsMatch;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateDate = (date) => {
    const Today = new Date();
    console.log(Today);
    const inputDate = new Date(date);
    if (inputDate > Today) {
      return false;
    }
    //if the user is less than 13 years old
    if (Today.getFullYear() - inputDate.getFullYear() < 13) {
      return false;
    }
    return true;
  }

  const validateSignUp = (event) => {
    event.preventDefault();
    const username = event.target[0].value;
    const password = event.target[1].value;
    const email = event.target[3].value;

    const usernameIsValid = validateUsername(username);
    const passwordIsValid = validatePassword(password);
    const passwordsMatch = validatePasswordMatch(
      password,
      event.target[2].value
    );
    const emailIsValid = validateEmail(email);
    const dateIsValid = validateDate(event.target[4].value);

    setIsUsernameValid(usernameIsValid);
    setIsPasswordValid(passwordIsValid);
    setArePasswordsMatching(passwordsMatch);
    setIsEmailValid(emailIsValid);
    setIsDateValid(dateIsValid);

    if (usernameIsValid && passwordIsValid && passwordsMatch && emailIsValid && dateIsValid) {
      processSignUp(event);
    }
  };

  return (
    <div className={Styles.signUpForm}>
      <h2>Sign up</h2>
      <hr className={Styles.line} />
      <form onSubmit={validateSignUp}>
        <label className={`label ${isUsernameValid ? "" : "invalid"}`}>
          Username
        </label>
        <input
          className={Styles.signUpInput}
          type="text"
          placeholder="Enter your username"
        />
        {!isUsernameValid && (
          <p className="invalid">
            Username must be at least 6 characters long and not contain special
            characters
          </p>
        )}

        <label className={`label ${isPasswordValid ? "" : "invalid"}`}>
          Password
        </label>
        <input
          className={Styles.signUpInput}
          type="password"
          placeholder="Enter your password"
        />
        {!isPasswordValid && (
          <p className="invalid">
            Password must contain at least one special character, one number,
            one uppercase letter and one lowercase letter
          </p>
        )}

        <label className={`label ${arePasswordsMatching ? "" : "invalid"}`}>
          Confirm Password
        </label>
        <input
          className={Styles.signUpInput}
          type="password"
          placeholder="Confirm password"
        />
        {!isPasswordValid && <p className="invalid">Passwords do not match</p>}

        <label className={`label ${isEmailValid ? "" : "invalid"}`}>
          Email
        </label>
        <input
          className={Styles.signUpInput}
          type="email"
          placeholder="Enter your email"
        />
        {!isEmailValid && <p className="invalid">Please enter valid email</p>}
        <label className={`label ${isDateValid ? "" : "invalid"}`}>Date of Birth</label>
        <input
          className={Styles.signUpInput}
          type="date"
        />
        {!isDateValid && <p className="invalid">To create account you need to be at least 13 years old</p>}
        <button className={Styles.buttonSignupForm} type="submit">Sign up</button>
        <p>or</p>
        <button className={Styles.buttonSignupForm} onClick={() => handleGoBack(false)}>Login</button>
      </form>
    </div>
  );
}
