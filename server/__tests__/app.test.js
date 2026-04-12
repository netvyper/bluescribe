const request = require('supertest');
const path = require('path');
const fs = require('fs');
const getApp = require('../app');

const TEST_DATA_DIR = path.join(__dirname, 'test_data');

describe('API Endpoints', () => {
  let app;

  beforeAll(() => {
    // Setup test data directory
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    }
    const systemDir = path.join(TEST_DATA_DIR, 'test-system');
    if (!fs.existsSync(systemDir)) {
      fs.mkdirSync(systemDir, { recursive: true });
    }
    fs.writeFileSync(path.join(systemDir, 'test-file.txt'), 'hello world');

    app = getApp(TEST_DATA_DIR);
  });

  afterAll(() => {
    // Cleanup test data directory
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  });

  it('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: 'OK' });
  });

  it('GET /api/systems should return list of directories', async () => {
    const res = await request(app).get('/api/systems');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toContain('test-system');
  });

  it('GET /api/files/* should return file content', async () => {
    const res = await request(app).get('/api/files/test-system/test-file.txt');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('hello world');
  });

  it('GET /api/files/* should prevent path traversal', async () => {
    const res = await request(app).get('/api/files/../app.js');
    // It should either return 403 Forbidden or not find the file inside the data dir (404)
    expect([403, 404]).toContain(res.statusCode);
  });

  it('GET /api/files/* should return 404 for non-existent file', async () => {
    const res = await request(app).get('/api/files/test-system/non-existent.txt');
    expect(res.statusCode).toEqual(404);
  });

  it('GET /api/files/* should return directory listing if directory', async () => {
    const res = await request(app).get('/api/files/test-system');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'test-file.txt', isDirectory: false })
      ])
    );
  });
});
