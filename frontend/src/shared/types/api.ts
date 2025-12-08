/**
 * Shared TypeScript Types - API
 */

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface ApiError {
    message: string;
    statusCode: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface PaymentInfo {
    amount: number;
    currency: string;
    network: string;
    recipient: string;
    description: string;
}
