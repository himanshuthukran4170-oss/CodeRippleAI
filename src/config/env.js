import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ quiet: true });

function readGithubPrivateKey() {
  if (process.env.GITHUB_PRIVATE_KEY) {
    return process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  const privateKeyPath = process.env.GITHUB_PRIVATE_KEY_PATH || './private-key.pem';

  if (!fs.existsSync(privateKeyPath)) {
    return null;
  }

  return fs.readFileSync(privateKeyPath, 'utf8');
}

function parseJsonEnvironment(name, fallback) {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(`WARNING: ${name} must contain valid JSON: ${error.message}`);
    return fallback;
  }
}

function readNumber(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

export const config = {
  port: process.env.PORT || 3000,

  github: {
    appId: process.env.GITHUB_APP_ID,
    privateKey: readGithubPrivateKey(),
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
    oauthClientId: process.env.GITHUB_OAUTH_CLIENT_ID || null,
    oauthClientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET || null,
    oauthCallbackUrl:
      process.env.GITHUB_OAUTH_CALLBACK_URL ||
      `http://localhost:${process.env.PORT || 3000}/api/auth/github/callback`,
  },

  mongo: {
    uri: process.env.MONGODB_URI || null,
    database: process.env.MONGODB_DATABASE || 'gitsense_ai',
  },

  dashboard: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET || 'gitsense-local-development-secret',
    sessionTtlSeconds: readNumber('JWT_TTL_SECONDS', 8 * 60 * 60),
    demoMode:
      process.env.DASHBOARD_DEMO_MODE !== undefined
        ? process.env.DASHBOARD_DEMO_MODE === 'true'
        : process.env.NODE_ENV !== 'production' && !process.env.MONGODB_URI,
  },

  review: {
    mode: process.env.REVIEW_MODE || 'full',
    includeAiReview: process.env.REVIEW_INCLUDE_AI !== 'false',
    includeSemanticContext: process.env.REVIEW_INCLUDE_RAG !== undefined
      ? process.env.REVIEW_INCLUDE_RAG === 'true'
      : undefined,
    geminiRetries: readNumber('GEMINI_REVIEW_MAX_RETRIES', 2),
    geminiTimeoutMs: readNumber('GEMINI_REVIEW_TIMEOUT_MS', 45000),
  },
};

if (
  !config.github.appId ||
  !config.github.privateKey ||
  !config.github.webhookSecret
) {
  console.warn('WARNING: GitHub App credentials are not fully configured');
}
