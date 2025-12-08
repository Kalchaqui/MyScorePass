/**
 * useSubscription Hook
 * Manages subscription and credit state
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import type { Balance, PurchaseResponse } from '../types';

export function useSubscription() {
    const [balance, setBalance] = useState<Balance | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await subscriptionService.getBalance();
            setBalance(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const purchaseCredits = useCallback(async (credits: number, simulatePayment: boolean = true) => {
        setLoading(true);
        setError(null);

        try {
            // First attempt without payment header (will get 402)
            try {
                const result = await subscriptionService.purchaseCredits(credits);
                setBalance(prev => prev ? { ...prev, credits: result.newBalance } : null);
                return result;
            } catch (firstError) {
                // If we get payment required and we want to simulate
                if (simulatePayment) {
                    const result = await subscriptionService.purchaseCredits(credits, 'simulated-payment');
                    setBalance(prev => prev ? { ...prev, credits: result.newBalance } : null);
                    return result;
                }
                throw firstError;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Load balance on mount
    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return {
        balance,
        loading,
        error,
        fetchBalance,
        purchaseCredits,
    };
}
