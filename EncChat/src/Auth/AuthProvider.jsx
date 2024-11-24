import { useContext, createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const navigate = useNavigate();

    const loginAction = async (data) => {
        
            //const response = await fetch("/api/auth/login", {
            //    method: "POST",
            //    headers: {
            //        "Content-Type": "application/json",
            //    },
            //    body: JSON.stringify(data),
            //});
            //const res = await response.json();
            //if(res.user && res.token) {
            //    setUser(res.user);
            //    setToken(res.token);
            //    localStorage.setItem("token", res.token);
            //    // send user to user-page
            //    navigate("/user-page", { state: { user: res.user } });
            //    return;
            //} else {
            //    throw new Error(res.message || 'Login failed');
            //}

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                })
                const res = await response.json();
                if(res.result) {
                    setUser(data);
                    setToken(res.token);
                    localStorage.setItem('token', res.token);
                    navigate('/user-page', { state: { user: data } });
                } else {
                    navigate('/', { state: { message: 'Login failed' } });
                }
            } catch (error) {
                console.error('Error logging in:', error);
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