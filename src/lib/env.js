/**
 * Environment variables validation and configuration
 */

// Define required environment variables
const requiredEnvVars = {
  // Add any required environment variables here
  // For example: API_KEY, DATABASE_URL, etc.
};

// Define optional environment variables with defaults
const optionalEnvVars = {
  NODE_ENV: 'development',
  PORT: '3000',
  API_PORT: '3001'
};

/**
 * Validates environment variables
 * @returns {Object} Validated environment configuration
 */
export function validateEnv() {
  const errors = [];
  const config = {};

  // Check required variables
  Object.keys(requiredEnvVars).forEach(key => {
    const value = import.meta.env[key];
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    } else {
      config[key] = value;
    }
  });

  // Set optional variables with defaults
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    config[key] = import.meta.env[key] || defaultValue;
  });

  // Additional validation
  if (config.NODE_ENV && !['development', 'production', 'test'].includes(config.NODE_ENV)) {
    errors.push(`Invalid NODE_ENV: ${config.NODE_ENV}. Must be 'development', 'production', or 'test'`);
  }

  if (config.PORT && isNaN(parseInt(config.PORT))) {
    errors.push(`Invalid PORT: ${config.PORT}. Must be a number`);
  }

  if (config.API_PORT && isNaN(parseInt(config.API_PORT))) {
    errors.push(`Invalid API_PORT: ${config.API_PORT}. Must be a number`);
  }

  // Throw error if validation fails
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }

  console.log('✅ Environment validation passed');
  return config;
}

/**
 * Get validated environment configuration
 */
export const env = validateEnv();

/**
 * Check if running in development mode
 */
export const isDevelopment = () => env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = () => env.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = () => env.NODE_ENV === 'test';

/**
 * Get API base URL based on environment
 */
export const getApiBaseUrl = () => {
  if (isProduction()) {
    return 'https://auto-trade-yellow-network.netlify.app/api';
  }
  return `http://localhost:${env.API_PORT || 3001}/api`;
};

export default env;