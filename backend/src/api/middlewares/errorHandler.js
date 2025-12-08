/**
 * Centralized Error Handling Middleware
 */

const logger = require('../../shared/logger');
const { AppError } = require('../../shared/errors');
const config = require('../../shared/config');

function errorHandler(err, req, res, next) {
    // Log error
    logger.error(err.message, {
        stack: err.stack,
        url: req.url,
        method: req.method,
        statusCode: err.statusCode,
    });

    // Handle operational errors
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            ...(err.paymentInfo && { paymentInfo: err.paymentInfo }),
            ...(err.required !== undefined && { required: err.required, available: err.available }),
        });
    }

    // Handle programming errors (don't leak details in production)
    const statusCode = err.statusCode || 500;
    const message = config.nodeEnv === 'development'
        ? err.message
        : 'Internal server error';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
}

// Async error wrapper
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    asyncHandler,
};
