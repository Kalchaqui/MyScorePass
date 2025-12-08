/**
 * JWT Configuration
 * Centralized JWT_SECRET configuration to ensure consistency across all modules
 */

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'myscorepass-jwt-secret-change-in-production';

// Log the JWT_SECRET status (without exposing the actual secret)
if (process.env.JWT_SECRET) {
  console.log('✅ JWT_SECRET loaded from environment variables');
} else {
  console.warn('⚠️  JWT_SECRET not found in environment, using default. This is not recommended for production.');
}

module.exports = {
  JWT_SECRET,
};

