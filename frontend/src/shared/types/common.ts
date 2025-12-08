/**
 * Shared TypeScript Types - Common
 */

export interface Exchange {
    id: string;
    name: string;
    email: string;
    walletAddress: string | null;
    credits: number;
    totalPurchased: number;
    totalConsumed: number;
    createdAt: string;
}

export interface MockUser {
    id: string;
    walletAddress: string;
    score: number;
    identity: {
        name: string;
        dni: string;
        email: string;
    };
    verificationLevel: number;
}

export interface Balance {
    credits: number;
    totalPurchased: number;
    totalConsumed: number;
    pricing: {
        usdcPerCredit: number;
        minPurchase: number;
    };
}

export interface UserStats {
    total: number;
    avgScore: number;
    minScore: number;
    maxScore: number;
    verificationLevels: Record<string, number>;
}
