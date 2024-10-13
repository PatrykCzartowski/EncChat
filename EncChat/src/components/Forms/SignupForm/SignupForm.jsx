import './Signup.module.css';

export default function SignupForm() {

    return (
        <div className="signup_form">
            <h2>Sign up</h2>
            <form>
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