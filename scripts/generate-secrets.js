#!/usr/bin/env node
/**
 * Generate cryptographically secure secrets for DEVTRACK deployment.
 * Usage: node scripts/generate-secrets.js
 */
import crypto from 'crypto';

const secret = () => crypto.randomBytes(64).toString('hex');
const encryptionKey = () => crypto.randomBytes(32).toString('hex');

console.log('# Copy these into your production environment (Render / Railway)\n');
console.log(`JWT_ACCESS_SECRET=${secret()}`);
console.log(`JWT_REFRESH_SECRET=${secret()}`);
console.log(`CSRF_SECRET=${secret()}`);
console.log(`ENCRYPTION_KEY=${encryptionKey()}`);
