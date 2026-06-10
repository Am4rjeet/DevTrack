import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),

  COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((val) => (val === '' || val === 'none' ? undefined : val))
    .default('localhost'),
  COOKIE_SECURE: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters'),

  GITHUB_TOKEN: z.string().optional().default(''),
  GITHUB_CLIENT_ID: z.string().optional().default(''),
  GITHUB_CLIENT_SECRET: z.string().optional().default(''),
  GITHUB_OAUTH_CALLBACK_URL: z.string().url().optional().or(z.literal('')).default(''),

  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_USER: z.string().optional().default(''),
  EMAIL_PASSWORD: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default('DevTrack <noreply@devtrack.app>'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),
  REGISTER_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(3_600_000),
  REGISTER_RATE_LIMIT_MAX: z.coerce.number().default(3),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(15),
  MAX_SIGNUPS_PER_IP_PER_DAY: z.coerce.number().default(5),

  TURNSTILE_SECRET_KEY: z.string().optional().default(''),

  REQUIRE_EMAIL_VERIFICATION: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return process.env.NODE_ENV === 'production';
    }),

  AUTO_VERIFY_EMAIL_IN_DEV: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'false') return false;
      if (val === 'true') return true;
      return process.env.NODE_ENV === 'development';
    }),

  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters').optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

export default env;
