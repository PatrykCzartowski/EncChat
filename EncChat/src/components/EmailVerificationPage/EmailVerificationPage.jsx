import { useState,useEffect } from 'react'

import styles from './EmailVerificationPage.module.css';

export default function EmailVerificationPage() {

    const [isEmailVerified, setIsEmailVerified] = useState(false);

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