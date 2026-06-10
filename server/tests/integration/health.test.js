import request from 'supertest';
import app from '../../src/app.js';
import { connectTestDB, disconnectTestDB } from '../helpers/db.js';

describe('Health API', () => {
  let dbAvailable = false;

  beforeAll(async () => {
    dbAvailable = await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it('GET / should return API info', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('DEVTRACK API');
  });

  it('GET /api/v1/health should return health status', async () => {
    if (!dbAvailable) {
      console.warn('Skipping DB health check: MongoDB not available');
      return;
    }

    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.database).toBe('connected');
  });

  it('GET /api/v1/unknown should return 404', async () => {
    const res = await request(app).get('/api/v1/unknown');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
