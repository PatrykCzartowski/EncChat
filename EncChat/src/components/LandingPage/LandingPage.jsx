import React, { useState } from "react";
import { Link } from "react-router-dom";
import Styles from "./LandingPage.module.css";
import Logo from "../Logo/Logo.jsx";
import SignUpForm from "../Forms/SignupForm/SignupForm.jsx";
import LoginForm from "../Forms/LoginForm/LoginForm.jsx";

export default function LandingPage() {
  const [isSignUpButtonClicked, setIsSignUpButtonClicked] = useState(false);

  const handleSignUpButton = (state) => {
    setIsSignUpButtonClicked(state);
  };

  return (
    <div className={Styles.landingPage}>
      <div className={Styles.banner}>
        <Logo />
      </div>


      <div className={Styles.contentContainer}>
        <div className={Styles.description}>
          <div className={Styles.secondaryLogoContainer}>
            <Logo />
          </div>
          <h1>Welcome.</h1>
          <Link to="/about-authors">about authors &rarr;</Link>
        </div>
        {isSignUpButtonClicked ? (
          <SignUpForm handleGoBack={handleSignUpButton} />
        ) : (
          <LoginForm handleSignUpButton={handleSignUpButton} />
        )}
      </div>
      <footer className={Styles.footer}>
        <div className={Styles.footerContent}>
          <p>
            authors: sampleEmail@email.com | sampleEmail2@email.com |
            sampleEmail3@email.com
          </p>
        </div>
      </footer>
    </div>
  );
}
