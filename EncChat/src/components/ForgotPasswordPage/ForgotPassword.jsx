import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {

    const navigate = useNavigate();

    useEffect(() => {
        if (!location.state || !location.state.checkVal) {
          // Redirect if he has not come from the email verification page
          navigate('/');
        }
      }, [location, navigate]);

    return (
        <div >
            <div >
                <img src='' alt="forgot password"/> 
            </div>
            <div>
                <form>
                    <input type="email" placeholder="Email"/>
                    <button>Send</button>
                </form>
                <Link to="/">Go back</Link>
            </div>
        </div>
    )   
}