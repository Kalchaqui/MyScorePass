/**
 * Subscription Service
 * Handles subscription and credit management API calls
 */

import { apiClient } from '@/shared/lib/api/client';
import type { Balance, PurchaseResponse, UsageHistory } from '../types';

export class SubscriptionService {
    async getBalance(): Promise<Balance> {
        const response = await apiClient.get<Balance>('/api/subscriptions/balance');
        return response.data!;
    }

    async purchaseCredits(credits: number, paymentHeader?: string): Promise<PurchaseResponse> {
        const headers: HeadersInit = {};
        if (paymentHeader) {
            headers['X-Payment'] = paymentHeader;
        }

        const response = await apiClient.post<PurchaseResponse>(
            '/api/subscriptions/purchase',
            { credits },
            headers
        );

        return response.data!;
    }

    async getUsageHistory(): Promise<UsageHistory> {
        const response = await apiClient.get<UsageHistory>('/api/subscriptions/usage');
        return response.data!;
    }
}

export const subscriptionService = new SubscriptionService();
