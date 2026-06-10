import { User } from '../../src/models/index.js';
import { connectTestDB, disconnectTestDB } from '../helpers/db.js';
import { createAuthAgent } from '../helpers/auth.js';

const testUser = {
  email: 'auth-test@example.com',
  username: 'authtestuser',
  password: 'Password123',
};

describe('Auth API', () => {
  let dbAvailable = false;

  beforeAll(async () => {
    dbAvailable = await connectTestDB();
  });

  afterAll(async () => {
    if (dbAvailable) {
      await User.deleteMany({ email: testUser.email });
    }
    await disconnectTestDB();
  });

  const runIfDb = (name, fn) => {
    it(name, async () => {
      if (!dbAvailable) {
        console.warn('Skipping: MongoDB not available');
        return;
      }
      await fn();
    });
  };

  runIfDb('should register a new user', async () => {
    const { agent, withCsrf } = await createAuthAgent();

    const res = await withCsrf(
      agent.post('/api/v1/auth/register').send(testUser)
    );

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.isEmailVerified).toBe(false);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  runIfDb('should reject duplicate registration', async () => {
    const { agent, withCsrf } = await createAuthAgent();

    const res = await withCsrf(
      agent.post('/api/v1/auth/register').send(testUser)
    );

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  runIfDb('should reject login when email is not verified', async () => {
    const { agent, withCsrf } = await createAuthAgent();

    const res = await withCsrf(
      agent.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      })
    );

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  runIfDb('should login with valid credentials after email verification', async () => {
    const { agent, withCsrf } = await createAuthAgent();

    await User.updateOne({ email: testUser.email }, { isEmailVerified: true });

    const res = await withCsrf(
      agent.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      })
    );

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  runIfDb('should reject login with wrong password', async () => {
    const { agent, withCsrf } = await createAuthAgent();

    const res = await withCsrf(
      agent.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      })
    );

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  runIfDb('should get current user with session', async () => {
    const { agent, withCsrf } = await createAuthAgent();

    await User.updateOne({ email: testUser.email }, { isEmailVerified: true });

    await withCsrf(
      agent.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      })
    );

    const res = await agent.get('/api/v1/auth/me');

    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe(testUser.username);
  });

  runIfDb('should refresh tokens', async () => {
    const { agent, withCsrf } = await createAuthAgent();

    await User.updateOne({ email: testUser.email }, { isEmailVerified: true });

    await withCsrf(
      agent.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      })
    );

    const res = await withCsrf(agent.post('/api/v1/auth/refresh'));

    expect(res.status).toBe(200);
    expect(res.body.data.user).toBeDefined();
  });

  runIfDb('should logout', async () => {
    const { agent, withCsrf } = await createAuthAgent();

    await User.updateOne({ email: testUser.email }, { isEmailVerified: true });

    await withCsrf(
      agent.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      })
    );

    const res = await withCsrf(agent.post('/api/v1/auth/logout'));

    expect(res.status).toBe(200);

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.status).toBe(401);
  });

  runIfDb('should reject requests without CSRF token', async () => {
    const { agent } = await createAuthAgent();

    const res = await agent.post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_ERROR');
  });
});
