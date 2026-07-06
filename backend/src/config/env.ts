import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5050),
  BACKEND_PUBLIC_URL: z.string().default('http://10.0.0.4:5050'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  JWT_EMAIL_SECRET: z.string().min(16),
  JWT_EMAIL_EXPIRES_IN: z.string().default('1d'),
  JWT_RESET_SECRET: z.string().min(16),
  JWT_RESET_EXPIRES_IN: z.string().default('1h'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  FRONTEND_URL: z.string().default('http://10.0.0.4:5051'),
  CORS_ALLOWED_ORIGINS: z.string().default('http://10.0.0.4:5051'),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_USER: z.string(),
  MAIL_PASSWORD: z.string(),
  MAIL_FROM: z.string(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Env inválido: ${parsed.error.message}`);
}

export const env = parsed.data;
