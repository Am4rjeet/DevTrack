import request from 'supertest';
import { User } from '../../src/models/index.js';
import app from '../../src/app.js';
import { connectTestDB, disconnectTestDB } from '../helpers/db.js';
import { createAuthAgent, registerUser } from '../helpers/auth.js';

const testUser = {
  email: 'analytics-test@example.com',
  username: 'analyticstest',
  password: 'Password123',
};

describe('Analytics, Dashboard & Leaderboard API', () => {
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

      await withCsrf(
        agent.post('/api/v1/progress').send({
          type: 'coding',
          title: 'Analytics test session',
          durationMinutes: 90,
          date: new Date().toISOString(),
        })
      );
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

  runIfDb('GET /analytics/overview should return stats', async () => {
    const res = await agent.get('/api/v1/analytics/overview?days=30');
    expect(res.status).toBe(200);
    expect(res.body.data.totalMinutes).toBeGreaterThan(0);
    expect(res.body.data.gamification).toBeDefined();
  });

  runIfDb('GET /analytics/heatmap should return grid', async () => {
    const res = await agent.get('/api/v1/analytics/heatmap?days=30');
    expect(res.status).toBe(200);
    expect(res.body.data.grid.length).toBe(30);
    expect(res.body.data.summary.activeDays).toBeGreaterThanOrEqual(1);
  });

  runIfDb('GET /analytics/charts/hours should return chart data', async () => {
    const res = await agent.get('/api/v1/analytics/charts/hours?days=7');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.data)).toBe(true);
  });

  runIfDb('GET /dashboard should return combined data', async () => {
    const res = await agent.get('/api/v1/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe(testUser.username);
    expect(res.body.data.weeklyProgress).toBeDefined();
    expect(res.body.data.heatmap).toBeDefined();
  });

  runIfDb('GET /leaderboard should be public', async () => {
    const res = await request(app).get('/api/v1/leaderboard?period=weekly');
    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe('weekly');
    expect(Array.isArray(res.body.data.rankings)).toBe(true);
  });

  runIfDb('GET /users/:username should return public profile', async () => {
    const res = await request(app).get('/api/v1/users/analyticstest');
    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe('analyticstest');
  });
});
