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
                })
                const res = await response.json();
                if(res.account && res.token) {
                    setUser(res.account);
                    setToken(res.token);
                    localStorage.setItem('token', res.token);
                    const accountProfile = await fetch('/api/account/get_profile', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: res.account.id }),
                    });
                    const accountProfileRes = await accountProfile.json();
                    if(accountProfileRes.lastName === '' || accountProfileRes.firstName === '') {
                        navigate('/profile-creation', { state: { account: res.account } });
                        return;
                    }
                    navigate('/user-page', { state: { account: res.account } });
                    return;
                } else {
                    navigate('/', { state: { message: 'Login failed' } });
                    return;
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