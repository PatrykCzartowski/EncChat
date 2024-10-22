import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import styles from './EmailVerificationPage.module.css';

function KeyGenerator(keyLength) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
  
    for (let i = 0; i < keyLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      key += characters[randomIndex];
    }
  
    return key;
  }

function SendEmailVerif(templateParams) {
      emailjs
          .send(
              'service_vwslm5v',
              'template_83c4oht',
              templateParams,
              'bQuJxmYn_RpyEwRv8'
          )
          .then(
              (result) => {
                  console.log('Email sent successfully', result.text);
              },
              (error) => {
                  console.log('Email failed to send', error.text);
              }
          );
  }

export default function EmailVerificationPage() {

    const [isKeyValid, setIsKeyValid] = useState(true); 

    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || {};
    const key = KeyGenerator(6); 
    
    const templateParams = {
        email: email,
        message: key
    }

    SendEmailVerif(templateParams);

    const verifyEmail = (event) => {
        event.preventDefault();
        const providedKey = event.target[0].value;
        if(providedKey == key) {
            navigate('/email-verified');
        } else {
            setIsKeyValid(false);
        }
        
    }
    
    return (
        <div className={styles.emailVerificationPage}>
            <img src="" alt="Some dope ass image of email"></img>
            <p>
                A verification email has been sent to your email address. Please enter the 6 character code from the email.
            </p>
            <form onSubmit={verifyEmail}>
                <input type="text" />
                {!isKeyValid && <p>Entered Key is not valid.</p>}
                <button type="submit">Verify</button>
            </form>
        </div>
    );
}