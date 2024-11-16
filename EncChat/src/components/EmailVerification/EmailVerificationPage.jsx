import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Styles from "./EmailVerificationPage.module.css";
import Logo from "../Logo/Logo";
import emailImg from "../../assets/emailVerifcation.svg";

import KeyGenerator from "../Utils/KeyGenerator";
import SendVerificationEmail from "../Utils/SendVerificationEmail";


export default function EmailVerificationPage() {
  
  const location = useLocation();
  const [isKeyValid, setIsKeyValid] = useState(true);
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const key = KeyGenerator(6);

  const navigate = useNavigate();
  const email = location.state?.signUpData?.email;
  
  useEffect(() => {
    if(!location.state?.signUpData) {
      navigate('/');
    }
  },[location, navigate]);

  const verifyEmail = async (event) => {
    event.preventDefault();
    const providedKey = event.target[0].value;
    if (providedKey == verificationKey) {
      try {
        const { username, password, email } = location.state?.signUpData;
        const response = await fetch(
          `/api/accounts/account/${username}/${password}/${email}`,
          {
            method: "PUT",
          }
        );
        navigate(`/email-verified/`, { state: { checkVal: true } });
      } catch (error) {
        console.error("Error verifying email: ", error);
      }
    } else {
      setIsKeyValid(false);
    }
  };

  const handleButtonClick = () => {
    const templateParams = {
      email: email,
      message: key,
    };
    SendVerificationEmail(templateParams);
    setIsButtonClicked(true);
  };

  return (
    <div className={Styles.emailVerificationPage}>
      <div className={Styles.banner}>
      <Logo/>
      </div>
      <div className={Styles.container}>
      <img src={emailImg} alt="logo" />
      <h2>Verify your Email</h2>
      <hr className={Styles.line} />
      <p>
        A verification email will be sent to your email address. Please enter
        the 6 character code from the email.
      </p>
      {!isButtonClicked ? (
        <button onClick={() => handleButtonClick()}>Send email</button>
      ) : (
        <form onSubmit={verifyEmail}>
          <input type="text" />
          {!isKeyValid && <p>Entered Key is not valid.</p>}
          <button type="submit">Verify</button>
        </form>
      )}
      </div>
    </div>
  );
}
