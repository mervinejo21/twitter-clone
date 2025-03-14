'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as authService from '@/lib/api/auth';
import { AuthResponse, LoginData, RegisterData } from '@/lib/api/auth';

interface AuthContextType {
    user: AuthResponse['user'] | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthResponse['user'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check if token exists
                const token = localStorage.getItem('token');

                if (token) {
                    // Fetch user profile
                    const userData = await authService.getProfile();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Authentication error:', error);
                // Clear invalid token
                localStorage.removeItem('token');
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (data: LoginData) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);
            setUser(response.user);
            router.push('/');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);
            setUser(response.user);
            router.push('/');
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 