import { encrypt, decrypt } from '../../../src/utils/encryption.utils.js';

describe('Encryption Utils', () => {
  it('should encrypt and decrypt a token', () => {
    const original = 'ghp_testtoken123456789';
    const encrypted = encrypt(original);

    expect(encrypted).not.toBe(original);
    expect(encrypted.split(':')).toHaveLength(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });
});
