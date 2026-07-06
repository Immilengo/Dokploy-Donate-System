import { transporter } from './mailer';
import { env } from '@config/env';
import { logger } from '@utils/logger';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export class MailService {
  async send(options: SendMailOptions) {
    try {
      await transporter.sendMail({
        from: env.MAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      logger.info({ message: `Email enviado para ${options.to}` });
    } catch (error) {
      logger.error({ message: `Falha ao enviar email para ${options.to}`, error });
      // não lança erro para não bloquear o fluxo principal
    }
  }
}