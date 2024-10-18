import Logo from '../Logo/Logo.jsx';
import LoginForm from '../Forms/LoginForm/LoginForm.jsx';
import SignupForm from '../Forms/SignupForm/SignupForm.jsx';

export default function LandingPage() {

    const handleSignUpData = (signUpData) => {
        console.log(signUpData)
    }

    return (
        <>
            <Logo />
            <div className="about_project">
                <h1>Welcome.</h1>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Duis eget pulvinar mi. Nulla facilisi. 
                    Ut eget nisl accumsan nibh rutrum pulvinar. 
                    In auctor cursus elit eu rutrum. 
                    Pellentesque semper nunc mollis, lobortis massa ut, dapibus nibh. 
                    Fusce eget ullamcorper ante. 
                    Etiam placerat nulla lacus, et placerat justo malesuada et. 
                    Pellentesque semper fringilla nisi sit amet eleifend. 
                    Curabitur malesuada fermentum auctor.
                </p>
            </div>
            <LoginForm />
            <div><p>or</p></div>
            <SignupForm onProcessSignUpData={handleSignUpData}/>
        </>
    );
}