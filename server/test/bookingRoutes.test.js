import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app.js';

describe('booking API boundary', () => {
  it('protects guest booking history', async () => {
    const response = await request(app).get('/api/bookings/me');
    expect(response.status).toBe(401);
  });

  it('protects admin booking operations', async () => {
    const response = await request(app).get('/api/admin/bookings');
    expect(response.status).toBe(401);
  });

  it('protects guest payment operations', async () => {
    const response = await request(app).post('/api/payments/bookings/1').send({
      paymentToken: 'tok_prototype_approved',
      method: 'card',
    });
    expect(response.status).toBe(401);
  });

  it('protects the guest notification center', async () => {
    const response = await request(app).get('/api/notifications');
    expect(response.status).toBe(401);
  });

  it('protects review submission', async () => {
    const response = await request(app).post('/api/reviews/bookings/1').send({
      rating: 5,
      title: 'Excellent stay',
      comment: 'The room was clean and comfortable.',
    });
    expect(response.status).toBe(401);
  });

  it('protects a guest review history', async () => {
    const response = await request(app).get('/api/reviews/me');
    expect(response.status).toBe(401);
  });

  it('supports date-aware room availability searches', async () => {
    const response = await request(app).get(
      '/api/rooms?checkIn=2030-01-10&checkOut=2030-01-12',
    );
    expect(response.status).toBe(200);
    expect(response.body.data.roomTypes.length).toBeGreaterThan(0);
  });
});
