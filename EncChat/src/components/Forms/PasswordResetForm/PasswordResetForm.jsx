import Styles from './PasswordResetForm.module.css';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SHA256 } from 'crypto-js';

export default function PasswordResetForm() {
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
    const [newPasswordIsValid, setNewPasswordIsValid] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    
    const accountId = location.state?.accountId;

    const validatePassword = (password) => {
        const passwordHasSpecialChars = specialCharPattern.test(password);
        const passwordHasNumber = numberPattern.test(password);
        const passwordHasUpperCase = upperCasePattern.test(password);
        const passwordHasLowerCase = lowerCasePattern.test(password);
        const passwordIsValid =
          passwordHasSpecialChars &&
          passwordHasNumber &&
          passwordHasUpperCase &&
          passwordHasLowerCase;
        return passwordIsValid;
      };

    const handlePasswordReset = async (event) => {
        event.preventDefault();
        const newPassword = event.target[0].value;
        const confirmPassword = event.target[1].value;
        if(newPassword === confirmPassword) {
            if(!validatePassword(newPassword)) {
                setNewPasswordIsValid(false);
                return;
            }
            const data = {
                accountId,
                newPassword: SHA256(newPassword).toString(),
            }
            const response = await fetch('/api/forgot_password/change_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data }),
            })
            const result = await response.json();
            if(result) {
                setPasswordChangeSuccess(true);
                return;
            }
            return;
        }
        setPasswordsMatch(false);
    }

    return (
        <div>
        {!passwordChangeSuccess? (
            <form onSubmit={handlePasswordReset}>
                <label htmlFor="password">New password</label>
                <input type="password" id="password" name="password" />
                <label htmlFor="confirmPassword">Confirm password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" />
                {!passwordsMatch && <p>Passwords do not match</p>}
                {!newPasswordIsValid && <p>Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character</p>}
                <button type="submit">Reset password</button>
            </form>
        ) : (
            <div>
                <h2>Password reset successful</h2>
                <p>Your password has been successfully reset. You can now log in with your new password.</p>
                <button onClick={() => navigate('/')}>Log in</button>
            </div>
        )}
        </div>
    );
}