import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const navigate = useNavigate();

    const loginAction = async (data) => {
        try {
            const response = await fetch("/api/account/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const res = await response.json();
            if (response.ok && res.accountId && res.token) {
                setUserId(res.accountId);
                setToken(res.token);
                localStorage.setItem("token", res.token);

                // Fetch user profile
                const profileResponse = await fetch("/api/profile/get", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${res.token}`,
                    },
                    body: JSON.stringify({ accountId: res.accountId }),
                });

                const profileData = await profileResponse.json();

                if (!profileResponse.ok || !profileData) {
                    navigate("/", { state: { message: "Profile fetch failed" } });
                    return;
                }

                if (!profileData.lastName || !profileData.firstName) {
                    navigate("/profile-creation", { state: { accountId: res.accountId } });
                    return;
                }

                navigate("/user-page", { state: { userId, userProfile: profileData } });
            } else {
                navigate("/", { state: { message: res.message || "Login failed" } });
            }
        } catch (error) {
            console.error("Error logging in:", error);
            navigate("/", { state: { message: "Login error" } });
        }
    };

    const logOut = () => {
        setUserId(null);
        setToken("");
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ token, userId, loginAction, logOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}