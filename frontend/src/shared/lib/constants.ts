/**
 * Shared Constants
 */

export const VERIFICATION_LEVELS = {
    NONE: 0,
    EMAIL: 1,
    ID_DOCUMENT: 2,
    FULL: 3,
} as const;

export const VERIFICATION_LEVEL_LABELS: Record<number, string> = {
    0: 'No verificado',
    1: 'Email verificado',
    2: 'Documento de identidad',
    3: 'Verificación completa',
};

export const SCORE_RANGES = {
    MIN: 300,
    MAX: 1000,
    GOOD: 700,
    EXCELLENT: 850,
} as const;

export const PRICING = {
    USDC_PER_CREDIT: 100,
    MIN_PURCHASE_CREDITS: 10,
} as const;
