import "./App.css";

import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage/LandingPage";
import ForgotPassword from "./components/ForgotPasswordPage/ForgotPassword";
import EmailVerification from "./components/EmailVerification/EmailVerificationPage";
import EmailVerified from "./components/EmailVerification/EmailVerified/EmailVerified";
import AboutAuthors from "./components/AboutAuthors/AboutAuthors";
import UserPage from "./components/UserPage/UserPage";
import ProfileCreation from "./components/ProfileCreation/ProfileCreation";
import AuthProvider from "./Auth/AuthProvider";
import PrivateRoute from "./Auth/PrivateRoute";
import PasswordResetForm from "./components/Forms/PasswordResetForm/PasswordResetForm";
import ProfileEdit from "./components/ProfileEdit/ProfileEdit";

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="email-verification" element={<EmailVerification />} />
            <Route path="email-verified" element={<EmailVerified />} />
            <Route path="reset-password-form" element={<PasswordResetForm />} />
            <Route path="about-authors" element={<AboutAuthors />} />
            <Route element={<PrivateRoute />}>
              <Route path="profile-creation" element={<ProfileCreation />} />
              <Route path="user-page" element={<UserPage />} />
              <Route path="profile-edit" element={<ProfileEdit />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
