/**
 * Application Constants
 */

const PRICING = {
    USDC_PER_CREDIT: 100,
    MIN_PURCHASE_CREDITS: 10,
};

const VERIFICATION_LEVELS = {
    NONE: 0,
    EMAIL: 1,
    ID_DOCUMENT: 2,
    FULL: 3,
};

const PAYMENT_AMOUNTS = {
    CALCULATE_SCORE: '2.00',
    QUERY_SCORE: '0.50',
    VERIFY_SBT: '0.10',
};

const SCORE_RANGES = {
    MIN: 300,
    MAX: 1000,
};

module.exports = {
    PRICING,
    VERIFICATION_LEVELS,
    PAYMENT_AMOUNTS,
    SCORE_RANGES,
};
