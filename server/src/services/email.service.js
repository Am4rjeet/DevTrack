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
      subject: 'Verify your DevTrack email',
      text: `Hi ${user.displayName || user.username},\n\nVerify your email: ${verifyUrl}\n\nLink expires in 24 hours.`,
      html: `
        <p>Hi ${user.displayName || user.username},</p>
        <p><a href="${verifyUrl}">Verify your email</a></p>
        <p>Expires in 24 hours. Ignore this if you didn't sign up.</p>
      `,
    });
  },

  async sendPasswordResetEmail(user, rawToken) {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

    return sendEmail({
      to: user.email,
      subject: 'Reset your DevTrack password',
      text: `Hi ${user.displayName || user.username},\n\nReset link: ${resetUrl}\n\nExpires in 1 hour.`,
      html: `
        <p>Hi ${user.displayName || user.username},</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>Expires in 1 hour. Ignore this if you didn't ask for a reset.</p>
      `,
    });
  },
};

export default emailService;
