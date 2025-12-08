/**
 * User Service
 * Handles mock user query API calls
 */

import { apiClient } from '@/shared/lib/api/client';
import type { UserFilters, UserQueryResponse, UserStats } from '../types';

export class UserService {
    async queryUsers(filters?: UserFilters): Promise<UserQueryResponse> {
        const params = new URLSearchParams();

        if (filters?.minScore !== undefined) {
            params.append('minScore', filters.minScore.toString());
        }
        if (filters?.maxScore !== undefined) {
            params.append('maxScore', filters.maxScore.toString());
        }
        if (filters?.verificationLevel !== undefined) {
            params.append('verificationLevel', filters.verificationLevel.toString());
        }
        if (filters?.name) {
            params.append('name', filters.name);
        }

        const queryString = params.toString();
        const endpoint = `/api/mockUsers${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get<UserQueryResponse>(endpoint);
        return response.data!;
    }

    async getStats(): Promise<UserStats> {
        const response = await apiClient.get<UserStats>('/api/mockUsers/stats');
        return response.data!;
    }

    async getUserById(id: string): Promise<any> {
        const response = await apiClient.get(`/api/mockUsers/${id}`);
        return response.data;
    }
}

export const userService = new UserService();
