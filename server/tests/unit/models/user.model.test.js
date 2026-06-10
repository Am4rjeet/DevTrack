import { User } from '../../../src/models/index.js';
import { connectTestDB, disconnectTestDB } from '../../helpers/db.js';

describe('User Model', () => {
  let dbAvailable = false;

  beforeAll(async () => {
    dbAvailable = await connectTestDB();
  });

  afterAll(async () => {
    if (dbAvailable) {
      await User.deleteMany({ email: /test@/ });
    }
    await disconnectTestDB();
  });

  (() => {
    const test = (name, fn) => {
      it(name, async () => {
        if (!dbAvailable) {
          console.warn('Skipping: MongoDB not available');
          return;
        }
        await fn();
      });
    };

    test('should hash password before saving', async () => {
      const user = await User.create({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
      });

      expect(user.password).not.toBe('Password123');
      expect(user.password).toMatch(/^\$2[aby]?\$/);
    });

    test('should compare passwords correctly', async () => {
      const user = await User.findOne({ email: 'test@example.com' }).select('+password');
      const isMatch = await user.comparePassword('Password123');
      const isWrong = await user.comparePassword('wrongpassword');

      expect(isMatch).toBe(true);
      expect(isWrong).toBe(false);
    });

    test('should enforce unique email', async () => {
      await expect(
        User.create({
          email: 'test@example.com',
          username: 'anotheruser',
          password: 'Password123',
        })
      ).rejects.toThrow();
    });

    test('should not return password in JSON', async () => {
      const user = await User.findOne({ email: 'test@example.com' });
      const json = user.toJSON();

      expect(json.password).toBeUndefined();
      expect(json.refreshTokens).toBeUndefined();
    });
  })();
});
