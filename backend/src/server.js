/**
 * Server Entry Point
 */

const app = require('./app');
const config = require('./shared/config');
const logger = require('./shared/logger');

const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`🚀 MyScorePass Backend running on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`x402 Mode: ${config.x402Mode}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
