import { env } from '@config/env';

const BASE = `http://localhost:${env.PORT}`;

export const verificationEmailTemplate = (fullName: string, token: string) => ({
  subject: 'Fundação Hubble — Verifica o teu email',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Fundação Hubble 💙</h2>
      <p>Olá, <strong>${fullName}</strong>!</p>
      <p>Clica no botão abaixo para verificar o teu email:</p>
      <a href="${BASE}/auth/verify-email?token=${token}"
         style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
        Verificar Email
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:14px;">
        Este link expira em 24 horas.
      </p>
    </div>
  `,
});

export const resetPasswordTemplate = (fullName: string, token: string) => ({
  subject: 'Fundação Hubble — Recuperação de palavra-passe',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Fundação Hubble 💙</h2>
      <p>Olá, <strong>${fullName}</strong>!</p>
      <p>Clica no botão abaixo para redefinir a tua palavra-passe:</p>
      <a href="${BASE}/auth/reset-password-page?token=${token}"
         style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
        Redefinir Palavra-passe
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:14px;">
        Este link expira em 1 hora.
      </p>
    </div>
  `,
});

export const welcomeGoogleTemplate = (fullName: string) => ({
  subject: 'Fundação Hubble — Bem-vindo(a)!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Fundação Hubble 💙</h2>
      <p>Olá, <strong>${fullName}</strong>!</p>
      <p>A tua conta foi criada com sucesso via Google. Já podes aceder à plataforma.</p>
      <p>Obrigado por fazeres parte desta missão! 💙</p>
    </div>
  `,
});