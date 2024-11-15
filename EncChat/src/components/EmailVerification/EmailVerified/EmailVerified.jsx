import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
    <div>
      <img src="" alt="Some dope ass image of email"></img>
      <h2>Your email was verified.</h2>
      <p>We'll automatically redirect you to landing page in</p>
      <h2>{seconds}</h2>
      <p>or you can go now by clicking on button below</p>
      <button>
        <Link to="/">Go back</Link>{" "}
      </button>
    </div>
  );
}
