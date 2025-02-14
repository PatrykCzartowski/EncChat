import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../Logo/Logo";
import KeyGenerator from "../Utils/KeyGenerator.js";
import Styles from "./ForgotPassword.module.css";
import SendPasswordResetEmail from "../Utils/SendPasswordResetEmail.js";

const key = KeyGenerator(6);

export default function ForgotPassword() {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [emailIsValid, setEmailIsValid] = useState(true); // for conditional rendering
  const [codeIsValid, setCodeIsValid] = useState(true); // for conditional rendering
  const [foundAccount, setFoundAccount] = useState();

  const navigate = useNavigate();

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    if(event.target[0].value === "") {
      setEmailIsValid(false);
      return;
    };
    setIsButtonClicked(true);
    const email = event.target[0].value;
    const accountData = { //this is so i can use the same model function that i used in login
      username: email,
      password: '',
      usernameIsEmail: true,
    }
    const response = await fetch('/api/forgot_password/find_account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountData }),
    })
    const account = await response.json();
    if(account) {
      setFoundAccount(account);
      const templateParams = {
        email: email,
        message: key,
      }
      SendPasswordResetEmail(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_RESET_PASSWORD_TEMPLATE,
        process.env.EMAILJS_PRIVATE_KEY,
        templateParams
      );
      return;
    }
    setEmailIsValid(false);
  }

  const handleResetPassword = async (event) => {
    event.preventDefault();
    const code = event.target[0].value;
    if(code === key) {
      navigate('/reset-password-form', {state: {email: foundAccount.email, accountId: foundAccount.id}});
      return;
    }
    setCodeIsValid(false);
  }

  return (
    <div className={Styles.forgotPasswordPage}>
      <div className={Styles.banner}>
      <Logo/>
      </div>
      <div className={Styles.container}>
      <h2>Forgot password</h2>
      <hr className={Styles.line} />
      {!isButtonClicked ? (
        <div>
        <p>
        Forgot password? Don’t worry, 
        we will send you an email to reset your password.
        </p>
        <div>
          <form onSubmit={handleEmailSubmit}>
            <input className={Styles.passwordInput} type="email" placeholder="Email" />
            {emailIsValid? null : <p>Provided email is Invalid</p>}
            <button className={Styles.buttonForgotPassword}>Send</button>
          </form>
        </div>
        </div>
      ) : (
        <div>
        <p>
        An email has been sent to your email address. 
        please enter the code in the email to reset your password below.
        </p>
        <form onSubmit={handleResetPassword}>
          <input className={Styles.passwordInput} type="text" placeholder="Enter your code here" />
          <button className={Styles.buttonForgotPassword} type="submit">Reset password</button>
        </form>
        </div>
      )}
      <Link to="/">Go back</Link>
      </div>
    </div>
  );
}
