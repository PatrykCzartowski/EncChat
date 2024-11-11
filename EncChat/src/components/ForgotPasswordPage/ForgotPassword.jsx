import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Logo from "../Logo/Logo";

import Styles from "./ForgotPassword.module.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  /*useEffect(() => {
    if (!location.state || !location.state.checkVal) {
      // Redirect if he has not come from the email verification page
      navigate("/");
    }
  }, [location, navigate]);*/

  return (
    <div className={Styles.forgotPasswordPage}>
      <Logo/>
      <div className={Styles.container}>
      <h2>Forgot password</h2>
      <hr className={Styles.line} />
      <p>
      Forgot password? Don’t worry, 
      we will send you an email to reset your password.
      </p>
      <div>
        <form>
          <input type="email" placeholder="Email" />
          <button>Send</button>
        </form>
        <Link to="/">Go back</Link>
      </div>
      </div>
    </div>
  );
}
