import request from 'supertest';
import express, { Application } from 'express';

// Create a simple test app (we'll update this when we have the full server)
const createTestApp = (): Application => {
  const app = express();

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'HR Management API is running',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};

describe('Health Endpoint', () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return 200 status code', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
    });

    it('should return success status', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should return correct message', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('message', 'HR Management API is running');
    });

    it('should return timestamp', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('should have valid JSON response', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
