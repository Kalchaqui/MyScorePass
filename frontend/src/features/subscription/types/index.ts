/**
 * Subscription Feature - Types
 */

import type { Balance } from '@/shared/types';

export interface PurchaseRequest {
    credits: number;
}

export interface PurchaseResponse {
    creditsAdded: number;
    newBalance: number;
    amountPaid: number;
}

export interface UsageHistory {
    totalPurchased: number;
    totalConsumed: number;
    currentBalance: number;
    transactions: any[]; // TODO: Define transaction type
}

export type { Balance };
