#!/usr/bin/env node
/**
 * Manually verify a user's email (local dev / admin helper).
 * Usage: node scripts/verify-user-email.js user@example.com
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/verify-user-email.js <email>');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const result = await mongoose.connection.collection('users').findOneAndUpdate(
  { email: email.toLowerCase() },
  {
    $set: { isEmailVerified: true },
    $unset: { emailVerificationToken: '', emailVerificationExpires: '' },
  },
  { returnDocument: 'after' }
);

if (!result) {
  console.error(`No user found for: ${email}`);
  process.exit(1);
}

console.log(`Verified email for: ${result.email} (@${result.username})`);
await mongoose.disconnect();
