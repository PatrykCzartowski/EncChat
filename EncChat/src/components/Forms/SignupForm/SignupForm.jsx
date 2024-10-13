import { useState } from 'react';

import './SignUp.module.css';

export default function SignUpForm() {

    const [isUsernameValid, setIsUsernameValid] = useState(true);
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [isEmailValid, setIsEmailValid] = useState(true);

    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
    const numberPattern = /[0-9]/;
    const upperCasePattern = /[A-Z]/;
    const lowerCasePattern = /[a-z]/;

    const processSignUp = (event) => {
        event.preventDefault();
        console.log("Sign up form submitted");
        const signUpData = {
            username: event.target[0].value,
            password: event.target[1].value,
            email: event.target[2].value
        }
        console.log(signUpData);
    }

    const validateUsername = (username) => {
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
        
        setIsPasswordValid(passwordIsValid);
        return passwordIsValid;
    }

    const validateEmail = (email) => {
        const emailIsValid = email.includes('@');
        setIsEmailValid(emailIsValid);
        return emailIsEmail;
    }

    const validateSignUp = (event) => {
        event.preventDefault();
        const username = event.target[0].value;
        const password = event.target[1].value;
        const email = event.target[2].value;
        
        const usernameIsValid = () => validateUsername(username);
        const passwordIsValid = () => validatePassword(password);
        const emailIsValid = () => validateEmail(email);

        if (usernameIsValid && passwordIsValid && emailIsValid) {
            processSignUp(event);
        }

    }

    return (
        <div className="signUpForm">
            <h2>Sign up</h2>
            <form onSubmit={processSignUp}>
                <label>Username</label>
                <input type="text" placeholder="Enter your username" />
                <label>Password</label>
                <input type="password" placeholder="Enter your password" />
                <label>Confirm Password</label>
                <input type="email" placeholder="Enter your email" />
                <p>WIP reCaptha</p>
                <button type="submit">Sign up</button>
            </form>
        </div>
    );
}