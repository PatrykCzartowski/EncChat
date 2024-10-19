import './App.css'

import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from './components/LandingPage/LandingPage'
import ForgotPassword from './components/ForgotPasswordPage/ForgotPassword';
import EmailVerification from './components/EmailVerificationPage/EmailVerificationPage';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="email-verification" element={<EmailVerification />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
