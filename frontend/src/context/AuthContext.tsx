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
    login: (token: string, user: User) => void;
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
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
