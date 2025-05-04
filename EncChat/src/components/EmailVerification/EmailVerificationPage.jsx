import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Styles from "./EmailVerificationPage.module.css";
import InputStyles from "../Forms/Input.module.css";
import Logo from "../Logo/Logo";
import emailImg from "../../assets/emailVerifcation.svg";
import KeyGenerator from "../Utils/KeyGenerator";
import sendEmail from "../Utils/sendEmail";

const key = KeyGenerator(6);

export default function EmailVerificationPage() {
  
  const location = useLocation();
  const [isKeyValid, setIsKeyValid] = useState(true);
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const navigate = useNavigate();
  const signUpData = location.state?.signUpData;
  const email = signUpData?.email;
  
  useEffect(() => {
    if(!location.state?.signUpData) {
      navigate('/');
    }
  },[location, navigate]);

  const verifyEmail = async (event) => {
    event.preventDefault();
    const providedKey = event.target[0].value;
    if (providedKey == key) {
      try {
        const response = await fetch("/api/account/login", {
          method: "POST", headers: { "Content-Type": "application/json", },
          body: JSON.stringify({ signUpData }),
        })
        if(response) {
          navigate("/email-verified");
        }
      } catch(error) {
        console.error("Error verifying email: ", error);
      }
    } else {
      setIsKeyValid(false);
    }
  };

  const handleButtonClick = async () => {
    const templateParams = {
      email: email,
      message: key,
    };
    
    const emailResponse = await fetch('/api/email/get', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'verify' }),
    });
    const emailServiceData = await emailResponse.json();

    sendEmail(emailServiceData.serviceId, emailServiceData.template, templateParams, emailServiceData.publicKey);
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
        <button className={Styles.buttonEmailVerificication} onClick={() => handleButtonClick()}>Send email</button>
      ) : (
        <form onSubmit={verifyEmail}>
          <input className={InputStyles.inputField} type="text" />
          {!isKeyValid && <p>Entered Key is not valid.</p>}
          <button className={Styles.buttonEmailVerificication} type="submit">Verify</button>
        </form>
      )}
      </div>
    </div>
  );
}
