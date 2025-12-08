/**
 * Auth Service
 * Handles authentication API calls
 */

import { apiClient } from '@/shared/lib/api/client';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types';
import type { Exchange } from '@/shared/types';

export class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

        if (response.data?.token) {
            apiClient.setToken(response.data.token);
        }

        return response.data!;
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/register', data);

        if (response.data?.token) {
            apiClient.setToken(response.data.token);
        }

        return response.data!;
    }

    async getProfile(): Promise<Exchange> {
        const response = await apiClient.get<Exchange>('/api/auth/me');
        return response.data!;
    }

    logout() {
        apiClient.clearToken();
    }

    getToken(): string | null {
        return apiClient.getToken();
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export const authService = new AuthService();
