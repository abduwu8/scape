import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  browserless: {
    apiKey: process.env.BROWSERLESS_API_KEY,
    url: process.env.BROWSERLESS_URL || 'wss://chrome.browserless.io',
  },
  security: {
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;

// Validate required environment variables
const requiredEnvVars = ['BROWSERLESS_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
} 