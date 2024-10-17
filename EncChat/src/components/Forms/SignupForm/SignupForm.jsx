import { useState } from 'react';

import styles from './SignUp.module.css';

export default function SignUpForm({onProcessSignUpData}) {

    const [isUsernameValid, setIsUsernameValid] = useState(true);
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [arePasswordsMatching, setArePasswordsMatching] = useState(true);
    const [isEmailValid, setIsEmailValid] = useState(true);

    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
    const numberPattern = /[0-9]/;
    const upperCasePattern = /[A-Z]/;
    const lowerCasePattern = /[a-z]/;

    const processSignUp = (event) => {
        const signUpData = {
            username: event.target[0].value,
            password: event.target[1].value,
            email: event.target[2].value
        }
        onProcessSignUpData(signUpData);
    }

    const validateUsername = (username) => {
        if(username.length < 6) {
            return false;
        }
        const usernameHasSpecialChars = specialCharPattern.test(username);
        setIsUsernameValid(!usernameHasSpecialChars);
        return !usernameHasSpecialChars;
    }

    const validatePassword = (password) => {
        const passwordHasSpecialChars = specialCharPattern.test(password);
        const passwordHasNumber = numberPattern.test(password);
        const passwordHasUpperCase = upperCasePattern.test(password);
        const passwordHasLowerCase = lowerCasePattern.test(password);
        const passwordIsValid = passwordHasSpecialChars && passwordHasNumber && passwordHasUpperCase && passwordHasLowerCase;
        return passwordIsValid;
    }

    const validatePasswordMatch = (password, confirmPassword) => {
        const passwordsMatch = password === confirmPassword;
        return passwordsMatch;
    }

    const validateEmail = (email) => {
        const emailIsValid = email.includes('@');
        return emailIsValid;
    }

    const validateSignUp = (event) => {
        event.preventDefault();
        const username = event.target[0].value;
        const password = event.target[1].value;
        const confirmPassword = event.target[2].value;
        const email = event.target[3].value;
        
        const usernameIsValid = validateUsername(username);
        const passwordIsValid = validatePassword(password);
        const passwordsMatch = validatePasswordMatch(password, event.target[2].value);
        const emailIsValid = validateEmail(email);

        setIsUsernameValid(usernameIsValid);
        setIsPasswordValid(passwordIsValid);
        setArePasswordsMatching(passwordsMatch);
        setIsEmailValid(emailIsValid);

        if (usernameIsValid && passwordIsValid && passwordsMatch && emailIsValid) {
            processSignUp(event);
        }

    }

    return (
        <div className="signUpForm">
            <h2>Sign up</h2>
            <form onSubmit={validateSignUp}>
                <label className={`label ${!isUsernameValid && 'invalid'}`}>Username</label>
                <input className={`input ${!isUsernameValid && 'invalid'}`} type="text" placeholder="Enter your username" />
                {!isUsernameValid && <p className="invalid">Username must be at least 6 characters long and not contain special characters</p>}

                <label className={`label ${!isPasswordValid && 'invalid'}`}>Password</label>
                <input className={`input ${!isPasswordValid && 'invalid'}`} type="password" placeholder="Enter your password" />
                {!isPasswordValid && <p className="invalid">Password must contain at least one special character, one number, one uppercase letter and one lowercase letter</p>}

                <label className={`label ${!arePasswordsMatching && 'invalid'}`}>Confirm Password</label>
                <input className={`input ${!arePasswordsMatching && 'invalid'}`} type="password" placeholder="Confirm password" />
                {!isPasswordValid && <p className="invalid">Passwords do not match</p>}

                <label className={`label ${!isEmailValid && 'invalid'}`}>Email</label>
                <input className={`input ${!isEmailValid && 'invalid'}`} type="email" placeholder="Enter your email" />
                {!isEmailValid && <p className="invalid">Email must contain an '@' character</p>}
                
                <p>WIP reCaptha</p>
                <button type="submit">Sign up</button>
            </form>
        </div>
    );
}