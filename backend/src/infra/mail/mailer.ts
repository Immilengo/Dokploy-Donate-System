import nodemailer from 'nodemailer';
import { env } from '@config/env';

export const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASSWORD,
    },
});