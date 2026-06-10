import { User } from '../../src/models/index.js';
import { connectTestDB, disconnectTestDB } from '../helpers/db.js';
import { createAuthAgent, registerUser } from '../helpers/auth.js';

const testUser = {
  email: 'goals-test@example.com',
  username: 'goalstest',
  password: 'Password123',
};

describe('Goals API', () => {
  let dbAvailable = false;
  let agent;
  let withCsrf;
  let goalId;

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

  runIfDb('should create a goal', async () => {
    const res = await withCsrf(
      agent.post('/api/v1/goals').send({
        title: 'Master React',
        category: 'coding',
        milestones: [{ title: 'Learn hooks' }, { title: 'Build project' }],
      })
    );

    expect(res.status).toBe(201);
    expect(res.body.data.goal.milestones).toHaveLength(2);
    goalId = res.body.data.goal._id;
  });

  runIfDb('should complete a goal and award XP', async () => {
    const res = await withCsrf(agent.patch(`/api/v1/goals/${goalId}/complete`));

    expect(res.status).toBe(200);
    expect(res.body.data.goal.status).toBe('completed');
  });

  runIfDb('should list goals', async () => {
    const res = await agent.get('/api/v1/goals?status=completed');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
