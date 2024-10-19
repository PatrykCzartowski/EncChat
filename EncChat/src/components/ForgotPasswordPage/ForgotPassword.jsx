import { Link } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {

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