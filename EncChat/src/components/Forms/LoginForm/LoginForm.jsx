import './LoginForm.module.css';

export default function LoginForm() {

    const processLogin = (event) => {
        event.preventDefault();
        console.log("Login form submitted");
        const username = event.target[0].value;
        const password = event.target[1].value;
        const usernameIsEmail = username.includes('@');
        
        const loginData = {
            username: username,
            password: password,
            usernameIsEmail: usernameIsEmail
        }
        console.log(loginData);
    }

    return (
        <div className="login_form">
            <h2>Login</h2>
            <form onSubmit={processLogin}>
                <label>Username</label>
                <input id="username" name="username" type="text" placeholder="Enter your username" />
                <label>Password</label>
                <input id="password" name="password" type="password" placeholder="Enter your password" />
                <a href="#">Forgot password?</a>
                <p>WIP reCaptha</p>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}