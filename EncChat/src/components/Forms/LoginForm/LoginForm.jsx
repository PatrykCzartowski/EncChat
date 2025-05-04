import { useState } from "react";
import { useAuth } from "../../../Auth/AuthProvider";
import { Link } from "react-router-dom";
import Styles from "./LoginForm.module.css";
import InputStyles from '../Input.module.css';
import SHA256 from "crypto-js/sha256";

export default function LoginForm({ handleSignUpButton }) {
 
  const [input, setInput] = useState({
    username: "",
    password: "",
    usernameIsEmail: false,
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmail = (username) => {
    return /\S+@\S+\.\S+/.test(username);
  }

  const auth = useAuth();

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
      general: ""
    };
    let isValid = true;
    
    if (!input.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }
    
    if (!input.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitEvent = async (event) => {
    event.preventDefault();
    
    setErrors({
      username: "",
      password: "",
      general: ""
    });
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const hashedPassword = SHA256(input.password).toString();
      const usernameIsEmail = isEmail(input.username);
      
      const result = await auth.loginAction({ 
        ...input, 
        password: hashedPassword, 
        usernameIsEmail 
      });
      
      if (result && result.error) {
        setErrors(prev => ({
          ...prev,
          general: result.message || "Invalid username or password"
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: "Login failed. Please try again."
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <div className={Styles.loginForm}>
      <h2>Login</h2>
      <hr className={Styles.line} />
      <form onSubmit={handleSubmitEvent}>
        <label>Username</label>
        <input
          id="username"
          name="username"
          type="text"
          className={InputStyles.inputField}
          placeholder="Enter your username"
          onChange={handleInput}
        />
        {errors.username && <p className={Styles.errorText}>{errors.username}</p>}

        <label>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className={InputStyles.inputField}
          placeholder="Enter your password"
          onChange={handleInput}
        />
        {errors.password && <p className={Styles.errorText}>{errors.password}</p>}

        {errors.general && (
        <div className={Styles.errorMessage}>
          {errors.general}
        </div>
        )}

        <Link to="/forgot-password" state={{ checkVal: true }}>
          Forgot password?
        </Link>
        <button 
          className={Styles.buttonLoginForm} 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        <p>or</p>
        <button className={Styles.buttonLoginForm} type="button" onClick={() => handleSignUpButton(true)}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
