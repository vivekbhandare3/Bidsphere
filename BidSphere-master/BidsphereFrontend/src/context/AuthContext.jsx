import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize user from localStorage if available to prevent flash on refresh
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // Login Function
    const login = () => {
        setIsAuthenticated(true);
    };

    const logout = async () => {
    console.log("React logout called");
        await api.post(
            "/logout",
            {},
            {
                withCredentials: true
            }
        );

    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);

    navigate("/login");
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await api.get(
                    "/profile",
                    {
                        withCredentials:true
                    }
                );
                const userInfo = res.data.user || res.data;

                const userData = {
                    username: userInfo.username,
                    role: userInfo.role,
                    name: userInfo.name
                };
                setUser(userData);
                setIsAuthenticated(true);
                // Save user info for page refresh
                localStorage.setItem("user", JSON.stringify(userData));

                const currentPath = window.location.pathname;
                
                if (currentPath === '/login' || currentPath === '/oauth2/redirect') {
                    if (userData.role === 'ADMIN') {
                        navigate('/admin/dashboard');
                    } else if (userData.role === 'SELLER') {
                        navigate('/seller-dashboard');
                    } else {
                        navigate('/'); // Normal users go to home
                    }
                }

            } catch (err) {
                console.error("Profile fetch failed:", err);

                localStorage.removeItem("user");
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [isAuthenticated,navigate]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated,
                isAdmin: user?.role === "ADMIN",
                isSeller: user?.role === "SELLER",
                isUser: user?.role === "USER"
            }}

        >
            {children}
        </AuthContext.Provider>
    );
};