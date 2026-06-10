import nodemailer from 'nodemailer';
import env, { isDevelopment } from '../config/env.js';
import logger from '../utils/logger.js';

const isEmailConfigured = () => Boolean(env.EMAIL_USER && env.EMAIL_PASSWORD);

let transporter = null;

const getTransporter = () => {
  if (!isEmailConfigured()) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();

  if (!transport) {
    if (isDevelopment) {
      logger.info(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
      logger.info(`[EMAIL DEV] Body: ${text || html}`);
    }
    return { devMode: true };
  }

  await transport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });

  return { devMode: false };
};

const emailService = {
  isConfigured: isEmailConfigured,

  async sendVerificationEmail(user, rawToken) {
    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;

    return sendEmail({
      to: user.email,
      subject: 'Verify your DEVTRACK account',
      text: `Welcome to DEVTRACK! Verify your email: ${verifyUrl}`,
      html: `
        <h2>Welcome to DEVTRACK</h2>
        <p>Hi ${user.displayName || user.username},</p>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${verifyUrl}">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create an account, ignore this email.</p>
      `,
    });
  },

  async sendPasswordResetEmail(user, rawToken) {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

    return sendEmail({
      to: user.email,
      subject: 'Reset your DEVTRACK password',
      text: `Reset your password: ${resetUrl}`,
      html: `
        <h2>Password Reset</h2>
        <p>Hi ${user.displayName || user.username},</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
  },
};

export default emailService;
