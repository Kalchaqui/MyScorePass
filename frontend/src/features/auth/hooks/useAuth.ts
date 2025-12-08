/**
 * useAuth Hook
 * Manages authentication state
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import type { Exchange } from '@/shared/types';
import type { LoginCredentials, RegisterData } from '../types';

export function useAuth() {
    const [user, setUser] = useState<Exchange | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const profile = await authService.getProfile();
                    setUser(profile);
                } catch (err) {
                    console.error('Failed to load user:', err);
                    authService.logout();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authService.login(credentials);
            setUser(response.exchange);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (data: RegisterData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authService.register(data);
            setUser(response.exchange);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    return {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };
}
