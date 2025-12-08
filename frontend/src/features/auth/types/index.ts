/**
 * Auth Feature - Types
 */

import type { Exchange } from '@/shared/types';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    walletAddress?: string;
}

export interface AuthResponse {
    exchange: Exchange;
    token: string;
}
