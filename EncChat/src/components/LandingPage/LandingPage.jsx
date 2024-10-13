import React from 'react';
import Styles from './LandingPage.module.css';  
import Logo from '../Logo/Logo';
import LoginForm from '../Forms/LoginForm/LoginForm';
import SignupForm from '../Forms/SignupForm/SignupForm';

const LandingPage = () => {
  return (
    <div className={Styles.landing_page}>
      <div className={Styles.banner}>
        <Logo />
      </div>

      <div className={Styles.contentContainer}> {/* Main content */}
        <div className={Styles.description}>
          <h1>Welcome.</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget pulvinar mi. Nulla facilisi. Ut eget nisl accumsan nibh rutrum pulvinar. 
            In auctor cursus elit eu rutrum. Pellentesque semper nunc mollis, lobortis massa ut, dapibus nibh. Fusce eget ullamcorper ante. 
            Etiam placerat nulla lacus, et placerat justo malesuada et. Pellentesque semper fringilla nisi sit amet eleifend. Curabitur malesuada fermentum auctor.</p>
          <a href="#">about authors &rarr;</a>
        </div>

        <div className={Styles.formsContainer}>
          <div className={Styles.form}>
            <LoginForm />
          </div>

          <div className={Styles.divider}>or</div>

          <div className={Styles.form}>
            <SignupForm />
          </div>
        </div>
      </div>

      <footer className={Styles.footer}>
        <div className={Styles.footerContent}>
          <p>authors: sampleEmail@email.com | sampleEmail2@email.com | sampleEmail3@email.com</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
