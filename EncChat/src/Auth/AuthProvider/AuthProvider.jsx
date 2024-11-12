import { useContext, createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const navigate = useNavigate();

    const loginAction = async (data) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await response.json();
            if(res.user && res.token) {
                console.log("User:", res.user);
                console.log("Token:", res.token);
                setUser(res.user);
                setToken(res.token);
                localStorage.setItem("token", res.token);
                navigate("/user-page");
                return;
            } else {
                throw new Error(res.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error during login: ', error);
        }
    };

    const logOut = () => {
        setUser(null);
        setToken("");
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <AuthContext.Provider value={{ token, user, loginAction, logOut }} >
            {children}
        </AuthContext.Provider>);
};

export function useAuth() {
    return useContext(AuthContext);
}