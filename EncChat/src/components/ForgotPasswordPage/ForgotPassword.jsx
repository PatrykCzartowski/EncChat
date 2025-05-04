import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../Logo/Logo";
import Styles from "./ForgotPassword.module.css";
import InputStyles from '../Forms/Input.module.css';
import sendEmail from "../Utils/sendEmail.js";

export default function ForgotPassword() {

  const [step, setStep] = useState('email'); // 'email' or 'code' only
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const accountData = {
        username: email,
        password: '',
        usernameIsEmail: true,
      };

      const accountResponse = await fetch('/api/account/find', {
        method: 'POST', headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ accountData }),
      });
      const account = await accountResponse.json();

      if(!account) throw new Error('No account found with this email');

      const templateParams = {
        email: email,
        message: generateResetCode(6),
      };

      const emailResponse = await fetch('/api/email/get', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reset' }),
      });
      const emailServiceData = await emailResponse.json();
      sendEmail(emailServiceData.serviceId, emailServiceData.template, templateParams, emailServiceData.publicKey);
      setStep('code');

    } catch (error) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCodeSubmit = async (event) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const code = e.target.code.value;

      if (code.length !== 6) throw new Error('Invalid code format');

      navigate('/reset-password-form', { state: { email } });
    
    } catch (error) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
// TODO: alert component to display error message
//  {error && (
//    <Alert variant="destructive">  
//      <AlertCircle />
//      <AlertDescription>{error}</AlertDescription>
//    </Alert>
//  )}

    <div className={Styles.forgotPasswordPage}>
      <div className={Styles.banner}><Logo/></div>
      <div className={Styles.container}>
        <h2>Forgot password</h2>
        <hr className={Styles.line} />

        {step === 'email' ? (
          <div>
            <p> Forgot password? Don't worry, we will send you an email to reset your password.</p>
            <div>
              <form onSubmit={handleEmailSubmit}>
                <input 
                  className={InputStyles.inputField}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={isLoading} className={Styles.buttonForgotPassword}>
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <p>We've sent a 6-digit code to your email. Enter it below to continue.</p>
            <form onSubmit={handleCodeSubmit}>
              <input 
                className={InputStyles.inputField}
                name="code"
                type="text"
                placeholder="Enter your code here"
                maxLength={6}
                pattern="\d{6}"
                required
              />
              <button type="submit" disabled={isLoading} className={Styles.buttonForgotPassword}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          </div>
        )}
        
        <Link to="/">Go back</Link>

      </div>
    </div>
  );
}

const generateResetCode = (length) => {
  return Array.from(
    { length }, 
    () => Math.floor(Math.random() * 10)
  ).join('');
};