import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/index.js';
import { CSRF_HEADER_NAME } from '../../src/middleware/csrf.middleware.js';

const createAuthAgent = async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get('/api/v1/auth/csrf');

  return {
    agent,
    csrfToken: csrfRes.body.data.csrfToken,
    withCsrf: (req) => req.set(CSRF_HEADER_NAME, csrfRes.body.data.csrfToken),
  };
};

const registerUser = async (agent, withCsrf, user) => {
  const res = await withCsrf(agent.post('/api/v1/auth/register').send(user));
  if (res.status === 201) {
    await User.updateOne({ email: user.email }, { isEmailVerified: true });
  }
  return res;
};

const verifyUserEmail = async (email) => {
  await User.updateOne({ email }, { isEmailVerified: true });
};

const loginUser = async (agent, withCsrf, credentials) => {
  return withCsrf(agent.post('/api/v1/auth/login').send(credentials));
};

export { createAuthAgent, registerUser, loginUser, verifyUserEmail };
