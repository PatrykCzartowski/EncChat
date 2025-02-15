import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import AuthProvider from "./Auth/AuthProvider";
import PrivateRoute from "./Auth/PrivateRoute";
import Loading from "./components/Utils/Loading/Loading";

const LandingPage = lazy(() => import("./components/LandingPage/LandingPage"));
const ForgotPassword = lazy(() => import("./components/ForgotPasswordPage/ForgotPassword"));
const EmailVerification = lazy(() => import("./components/EmailVerification/EmailVerificationPage"));
const EmailVerified = lazy(() => import("./components/EmailVerification/EmailVerified/EmailVerified"));
const AboutAuthors = lazy(() => import("./components/AboutAuthors/AboutAuthors"));
const UserPage = lazy(() => import("./components/UserPage/UserPage"));
const ProfileCreation = lazy(() => import("./components/ProfileCreation/ProfileCreation"));
const PasswordResetForm = lazy(() => import("./components/Forms/PasswordResetForm/PasswordResetForm"));
const ProfileEdit = lazy(() => import("./components/ProfileEdit/ProfileEdit"));

const NotFound = () => <h1>404 - Page Not Found</h1>;

const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "forgot-password", element: <ForgotPassword /> },
  { path: "email-verification", element: <EmailVerification /> },
  { path: "email-verified", element: <EmailVerified /> },
  { path: "reset-password-form", element: <PasswordResetForm /> },
  { path: "about-authors", element: <AboutAuthors /> },
  {
    element: <PrivateRoute />,
    children: [
      { path: "profile-creation", element: <ProfileCreation /> },
      { path: "user-page", element: <UserPage /> },
      { path: "profile-edit", element: <ProfileEdit /> },
    ],
  },
  { path: "*", element: <NotFound /> },
];

function AppRoutes() {
  return useRoutes(routes);
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
