import { sanitizeUserForClient } from '../../../src/utils/sanitizeUser.utils.js';

describe('sanitizeUserForClient', () => {
  it('should strip sensitive fields from user objects', () => {
    const sanitized = sanitizeUserForClient({
      _id: '507f1f77bcf86cd799439011',
      email: 'user@example.com',
      username: 'devuser',
      password: 'hidden',
      refreshTokens: [{ tokenHash: 'abc' }],
      emailVerificationToken: 'secret',
      role: 'admin',
      totalXP: 100,
    });

    expect(sanitized.email).toBe('user@example.com');
    expect(sanitized.totalXP).toBe(100);
    expect(sanitized.password).toBeUndefined();
    expect(sanitized.refreshTokens).toBeUndefined();
    expect(sanitized.emailVerificationToken).toBeUndefined();
    expect(sanitized.role).toBeUndefined();
    expect(sanitized.id).toBe('507f1f77bcf86cd799439011');
  });
});
