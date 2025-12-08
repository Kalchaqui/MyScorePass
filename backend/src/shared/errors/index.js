/**
 * Custom Error Classes
 * Provides structured error handling across the application
 */

class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Not authorized') {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}

class PaymentRequiredError extends AppError {
    constructor(paymentInfo) {
        super('Payment required', 402);
        this.paymentInfo = paymentInfo;
    }
}

class InsufficientCreditsError extends AppError {
    constructor(required = 1, available = 0) {
        super(`Insufficient credits. Required: ${required}, Available: ${available}`, 403);
        this.required = required;
        this.available = available;
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    PaymentRequiredError,
    InsufficientCreditsError,
};
