import { useState } from 'react'
import { useLocation } from 'react-router-dom';
import { useRef } from 'react';
import emailjs from 'emailjs-com';

import styles from './EmailVerificationPage.module.css';
import { KeyGenerator } from '../../utils/KeyGenerator';

export default function EmailVerificationPage() {

    const location = useLocation();
    const { email } = location.state || {};
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const key = KeyGenerator(6);  
    
    const templateParams = {
        email: email,
        message: key
    }

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

    const verifyEmail = () => {
        setIsEmailVerified(true);
    }
    
    return (
        <div className={styles.emailVerificationPage}>
            <img src="" alt="Some dope ass image of email"></img>
            <p>
                A verification email has been sent to your email address. Please click the link in the email to verify your email address.
            </p>
        </div>
    );
}