import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContextBase';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on load
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // 1. Login to backend to get custom token
            const response = await api.post('/auth/admin/login', { email, password });
            const { token: customToken, ...userData } = response.data.data;

            // 2. Exchange custom token for ID token using Firebase Client SDK
            const { signInWithCustomToken } = await import('firebase/auth');
            const { auth } = await import('../config/firebase');

            const userCredential = await signInWithCustomToken(auth, customToken);
            const idToken = await userCredential.user.getIdToken();

            // 3. Store ID token and user data
            localStorage.setItem('token', idToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message || 'Login failed'
            };
        }
    };

    const demoLogin = () => {
        const demoUser = {
            userId: 'demo-admin',
            name: 'Demo Admin',
            email: 'admin@hellocare.com',
            role: 'admin'
        };
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, demoLogin, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
