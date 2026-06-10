import crypto from 'crypto';
import env from '../config/env.js';
import AppError from './AppError.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const getKey = () => {
  if (!env.ENCRYPTION_KEY) {
    throw new AppError(
      'ENCRYPTION_KEY is required to store GitHub tokens',
      500,
      'ENCRYPTION_NOT_CONFIGURED'
    );
  }

  const key = Buffer.from(env.ENCRYPTION_KEY.slice(0, 64), 'hex');
  if (key.length !== 32) {
    throw new AppError('ENCRYPTION_KEY must be a 32-byte hex string (64 chars)', 500, 'ENCRYPTION_INVALID');
  }
  return key;
};

export const encrypt = (plaintext) => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (payload) => {
  const key = getKey();
  const [ivHex, authTagHex, encryptedHex] = payload.split(':');

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new AppError('Invalid encrypted payload', 500, 'DECRYPTION_ERROR');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};

export const isEncryptionConfigured = () => Boolean(env.ENCRYPTION_KEY);
