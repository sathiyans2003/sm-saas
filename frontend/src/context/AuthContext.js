import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile } from '../api/authApi';
import setAuthToken from '../utils/setAuthToken';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            // Set token in headers BEFORE making request
            setAuthToken(token);

            const res = await getProfile();
            setUser(res.data);
        } catch (err) {
            console.error("Failed to load user profile");
            localStorage.removeItem('token'); // Invalid token? Clear it.
            setAuthToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, refreshUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
