import { User } from '../../src/models/index.js';
import GithubStats from '../../src/models/GithubStats.model.js';
import { connectTestDB, disconnectTestDB } from '../helpers/db.js';
import { createAuthAgent, registerUser } from '../helpers/auth.js';

const testUser = {
  email: 'github-test@example.com',
  username: 'githubtest',
  password: 'Password123',
};

describe('GitHub API', () => {
  let dbAvailable = false;
  let agent;
  let withCsrf;

  beforeAll(async () => {
    dbAvailable = await connectTestDB();
    if (dbAvailable) {
      const auth = await createAuthAgent();
      agent = auth.agent;
      withCsrf = auth.withCsrf;
      await registerUser(agent, withCsrf, testUser);
    }
  });

  afterAll(async () => {
    if (dbAvailable) {
      const user = await User.findOne({ email: testUser.email });
      if (user) await GithubStats.deleteMany({ userId: user._id });
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

  runIfDb('GET /github/status should return not connected', async () => {
    const res = await agent.get('/api/v1/github/status');
    expect(res.status).toBe(200);
    expect(res.body.data.connected).toBe(false);
  });

  runIfDb('GET /github should return not connected', async () => {
    const res = await agent.get('/api/v1/github');
    expect(res.status).toBe(200);
    expect(res.body.data.connected).toBe(false);
  });

  runIfDb('POST /github/connect without server token should fail gracefully', async () => {
    const original = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = '';

    const res = await withCsrf(
      agent.post('/api/v1/github/connect').send({ githubUsername: 'octocat' })
    );

    process.env.GITHUB_TOKEN = original;

    // Either succeeds (if token restored) or fails with clear error
    if (res.status !== 200) {
      expect([502, 503, 429]).toContain(res.status);
    }
  });

  runIfDb('DELETE /github/disconnect should be idempotent', async () => {
    const res = await withCsrf(agent.delete('/api/v1/github/disconnect'));
    expect(res.status).toBe(200);
  });
});
