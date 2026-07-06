import { z } from 'zod';

export const registerSchema= z.object({
    fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email Inválido'),
    password: z.string().min(6,'Password deve ter pelo menos 6 carateres'),
    phone: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1,'Password Obrigatória')
});


export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password deve ter pelo menos 8 caracteres'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Email inválido'),
});