import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Styles from "./LandingPage.module.css";
import Logo from "../Logo/Logo.jsx";
import SignUpForm from "../Forms/SignupForm/SignupForm.jsx";
import LoginForm from "../Forms/LoginForm/LoginForm.jsx";

export default function LandingPage() {
  const [users, setUsers] = useState([]);
  const [isSignUpButtonClicked, setIsSignUpButtonClicked] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/accounts");
        const data = await response.json();
        setUsers(data);
        console.log("Users fetched:", data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSignUpButton = (state) => {
    setIsSignUpButtonClicked(state);
  };

  return (
    <div className={Styles.landingPage}>
      <div className={Styles.banner}>
        <Logo />
      </div>

      <div className={Styles.contentContainer}>
        {/* Main content */}
        <div className={Styles.description}>
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
