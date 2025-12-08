/**
 * useUsers Hook
 * Manages user query state
 */

'use client';

import { useState, useCallback } from 'react';
import { userService } from '../services/userService';
import type { UserFilters, UserQueryResponse, UserStats, MockUser } from '../types';

export function useUsers() {
    const [users, setUsers] = useState<MockUser[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const queryUsers = useCallback(async (filters?: UserFilters) => {
        setLoading(true);
        setError(null);

        try {
            const data = await userService.queryUsers(filters);
            setUsers(data.users);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to query users';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await userService.getStats();
            setStats(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        users,
        stats,
        loading,
        error,
        queryUsers,
        fetchStats,
    };
}
