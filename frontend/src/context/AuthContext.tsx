'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    email: string;
    roles: string[];
    profile?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User, refreshToken?: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get('/auth/me');
                if (response.data?.success) {
                    setUser(response.data.data);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = (token: string, userData: User, refreshToken?: string) => {
        localStorage.setItem('token', token);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        setUser(userData);
    };

    const logout = () => {
        const refreshToken = localStorage.getItem('refreshToken');
        // Best-effort revoke on the server; the local session is cleared regardless of the outcome.
        if (refreshToken) {
            api.post('/auth/logout', { refreshToken }).catch(() => { });
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
