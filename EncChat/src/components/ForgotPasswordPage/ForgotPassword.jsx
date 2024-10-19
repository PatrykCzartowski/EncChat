import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {

    const handleFormSubmit = (event) => {
        event.preventDefault();
        console.log('Form submitted');
        const email = event.target[0].value;
        console.log('Email:', email);
    }

    return (
        <div className={styles.forgotPassword}>
            <div className={styles.forgotPasswordImage}>
                <img src='' alt="forgot password"/>
            </div>
            <div className={styles.forgotPasswordForm}>
                <form onSubmit={handleFormSubmit()}>
                    <input type="email" placeholder="Email"/>
                    <button>Send</button>
                </form>
            </div>
        </div>
    )   
}