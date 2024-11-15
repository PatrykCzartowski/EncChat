import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import emailjs from "emailjs-com";
import styles from "./EmailVerificationPage.module.css";

function KeyGenerator(keyLength) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";

  for (let i = 0; i < keyLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters[randomIndex];
  }

  return key;
}

function SendEmailVerif(templateParams) {
  emailjs
    .send(
      "service_vwslm5v",
      "template_83c4oht",
      templateParams,
      "bQuJxmYn_RpyEwRv8"
    )
    .then(
      (result) => {
        console.log("Email sent successfully", result.text);
      },
      (error) => {
        console.log("Email failed to send", error.text);
      }
    );
}

export default function EmailVerificationPage() {
  
  const location = useLocation();
  const [verificationKey, setVerificationKey] = useState("");
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
    setVerificationKey(key);
    const templateParams = {
      email: email,
      message: key,
    };
    SendEmailVerif(templateParams);
    setIsButtonClicked(true);
  };

  return (
    <div className={styles.emailVerificationPage}>
      <img src="" alt="Some dope ass image of email"></img>
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
  );
}
