import './LoginForm.module.css';

export default function LoginForm() {
    return (
        <div className="login_form">
            <h2>Login</h2>
            <form>
                <label>Username</label>
                <input type="text" placeholder="Enter your username" />
                <label>Password</label>
                <input type="password" placeholder="Enter your password" />
                <a href="#">Forgot password?</a>
                <p>WIP reCaptha</p>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}