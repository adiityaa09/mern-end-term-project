const request = require('supertest');
const app = require('../src/app');

describe('Health Check API', () => {
  it('should return health status payload', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('status', 'UP');
    expect(res.body.data).toHaveProperty('uptimeSeconds');
    expect(res.body.data).toHaveProperty('database');
    expect(res.body.data).toHaveProperty('system');
  });

  it('should return 404 for undefined routes in standard error format', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route not found');
  });
});
