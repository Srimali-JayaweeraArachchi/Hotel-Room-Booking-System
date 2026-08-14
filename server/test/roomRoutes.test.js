import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app.js';

describe('room inventory API', () => {
  it('returns available room types with inventory counts', async () => {
    const response = await request(app).get('/api/rooms?guests=2&maxPrice=30000');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.roomTypes.length).toBeGreaterThan(0);
    expect(response.body.data.roomTypes[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        basePrice: expect.any(Number),
        availableRooms: expect.any(Number),
        amenities: expect.any(Array),
      }),
    );
  });

  it('validates invalid price ranges before searching', async () => {
    const response = await request(app).get('/api/rooms?minPrice=30000&maxPrice=10000');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Please correct the highlighted information');
  });

  it('protects the admin inventory API', async () => {
    const response = await request(app).get('/api/admin/inventory/rooms');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication token is required');
  });
});
