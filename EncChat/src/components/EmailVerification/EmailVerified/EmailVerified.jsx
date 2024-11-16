import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Styles from "./EmailVerified.module.css";
import Logo from "../../Logo/Logo";
import emailImg from "../../../assets/emailVerified.svg";

export default function EmailVerified() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(10);

  const location = useLocation();

  useEffect(() => {
    if (!location.state?.checkVal) {
      navigate("/");
    }
    if (seconds > 0) {
      const timer = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1); // Decrease seconds by 1
      }, 1000);

      return () => clearInterval(timer);
    } else if (seconds === 0) {
      navigate("/");
    }
  }, [seconds, location, navigate]);

  return (
    <div className={Styles.emailVerified}>
      <div className={Styles.banner}>
      <Logo/>
      </div>
      <div className={Styles.container}>
      <img src={emailImg} alt="logo" />
      <h2>Your email was verified.</h2>
      <hr className={Styles.line} />
      <p>We'll automatically redirect you to landing page in</p>
      <h2>{seconds}</h2>
      <p>or you can go now by clicking on button below</p>
      <button>
        <Link to="/">Go back</Link>{" "}
      </button>
      </div>
    </div>
  );
}
