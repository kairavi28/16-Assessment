const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');
let originalData;
let app;

beforeAll(async () => {
  originalData = await fs.readFile(DATA_PATH, 'utf8');
  app = require('../index');
});

afterAll(async () => {
  await fs.writeFile(DATA_PATH, originalData, 'utf8');
});

describe('GET /api/items', () => {
  it('should return paginated items with default pagination', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
    expect(res.body).toHaveProperty('totalPages');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('should respect limit parameter', async () => {
    const res = await request(app).get('/api/items?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeLessThanOrEqual(2);
    expect(res.body.limit).toBe(2);
  });

  it('should respect page parameter', async () => {
    const res = await request(app).get('/api/items?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
  });

  it('should filter items by search query', async () => {
    const res = await request(app).get('/api/items?q=laptop');
    expect(res.status).toBe(200);
    expect(res.body.items.every(item => 
      item.name.toLowerCase().includes('laptop') || 
      (item.category && item.category.toLowerCase().includes('laptop'))
    )).toBe(true);
  });

  it('should return empty items for non-matching search', async () => {
    const res = await request(app).get('/api/items?q=xyznonexistent');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('should combine search and pagination', async () => {
    const res = await request(app).get('/api/items?q=e&limit=2&page=1');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeLessThanOrEqual(2);
  });
});

describe('GET /api/items/:id', () => {
  it('should return a single item by id', async () => {
    const res = await request(app).get('/api/items/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('price');
  });

  it('should return 404 for non-existent item', async () => {
    const res = await request(app).get('/api/items/999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('message', 'Item not found');
  });

  it('should handle invalid id format gracefully', async () => {
    const res = await request(app).get('/api/items/invalid');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/items', () => {
  it('should create a new item with valid data', async () => {
    const newItem = { name: 'Test Item', category: 'Test', price: 99.99 };
    const res = await request(app)
      .post('/api/items')
      .send(newItem)
      .set('Content-Type', 'application/json');
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Item');
    expect(res.body.category).toBe('Test');
    expect(res.body.price).toBe(99.99);
  });

  it('should reject item without name', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ price: 100 })
      .set('Content-Type', 'application/json');
    
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Name is required');
  });

  it('should reject item with empty name', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: '   ', price: 100 })
      .set('Content-Type', 'application/json');
    
    expect(res.status).toBe(400);
  });

  it('should reject item without price', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test' })
      .set('Content-Type', 'application/json');
    
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Price is required');
  });

  it('should reject item with negative price', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test', price: -10 })
      .set('Content-Type', 'application/json');
    
    expect(res.status).toBe(400);
  });

  it('should assign default category if not provided', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'No Category Item', price: 50 })
      .set('Content-Type', 'application/json');
    
    expect(res.status).toBe(201);
    expect(res.body.category).toBe('Uncategorized');
  });
});

describe('Error handling', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
