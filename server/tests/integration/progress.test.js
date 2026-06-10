import { User } from '../../src/models/index.js';
import { connectTestDB, disconnectTestDB } from '../helpers/db.js';
import { createAuthAgent, registerUser } from '../helpers/auth.js';

const testUser = {
  email: 'progress-test@example.com',
  username: 'progresstest',
  password: 'Password123',
};

describe('Progress API', () => {
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

  runIfDb('should create a progress entry and award XP', async () => {
    const res = await withCsrf(
      agent.post('/api/v1/progress').send({
        type: 'coding',
        title: 'Built auth module',
        durationMinutes: 60,
        date: new Date().toISOString(),
      })
    );

    expect(res.status).toBe(201);
    expect(res.body.data.entry.xpEarned).toBe(6);
    expect(res.body.data.user.totalXP).toBeGreaterThan(0);
    expect(res.body.data.achievements.length).toBeGreaterThanOrEqual(1);
  });

  runIfDb('should list progress entries', async () => {
    const res = await agent.get('/api/v1/progress');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
  });

  runIfDb('should return progress summary', async () => {
    const res = await agent.get('/api/v1/progress/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.totalEntries).toBeGreaterThanOrEqual(1);
    expect(res.body.data.gamification.totalXP).toBeGreaterThan(0);
  });

  runIfDb('should return gamification stats', async () => {
    const res = await agent.get('/api/v1/stats');

    expect(res.status).toBe(200);
    expect(res.body.data.level).toBeGreaterThanOrEqual(1);
  });
});
