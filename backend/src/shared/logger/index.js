/**
 * Logger Utility
 * Centralized logging with different levels
 */

const config = require('../config');

const LogLevel = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
};

class Logger {
    constructor() {
        this.isDevelopment = config.nodeEnv === 'development';
    }

    _log(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta,
        };

        if (this.isDevelopment) {
            // Pretty print in development
            console.log(`[${timestamp}] [${level}] ${message}`, meta);
        } else {
            // JSON format in production
            console.log(JSON.stringify(logEntry));
        }
    }

    error(message, meta = {}) {
        this._log(LogLevel.ERROR, message, meta);
    }

    warn(message, meta = {}) {
        this._log(LogLevel.WARN, message, meta);
    }

    info(message, meta = {}) {
        this._log(LogLevel.INFO, message, meta);
    }

    debug(message, meta = {}) {
        if (this.isDevelopment) {
            this._log(LogLevel.DEBUG, message, meta);
        }
    }
}

// Export singleton instance
module.exports = new Logger();
