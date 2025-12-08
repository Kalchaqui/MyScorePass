/**
 * Users Feature - Types
 */

import type { MockUser, UserStats } from '@/shared/types';

export interface UserFilters {
    minScore?: number;
    maxScore?: number;
    verificationLevel?: number;
    name?: string;
}

export interface UserQueryResponse {
    users: MockUser[];
    count: number;
    filters: UserFilters;
}

export type { MockUser, UserStats };
