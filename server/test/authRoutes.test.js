import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app.js';

describe('authentication API boundary', () => {
  it('rejects an unauthenticated profile request', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Authentication token is required',
    });
  });

  it('rejects invalid guest registration input before database access', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'A',
      email: 'not-an-email',
      password: 'weak',
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Please correct the highlighted information');
    expect(response.body.details).toBeDefined();
    expect(response.body.details.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'password' }),
      ]),
    );
  });

  it('does not allow clients to assign a privileged role during registration', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Valid Guest',
      email: 'guest@example.com',
      password: 'Guest123',
      role: 'admin',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Please correct the highlighted information');
  });

  it('protects user management from unauthenticated access even with empty filters', async () => {
    const response = await request(app).get('/api/admin/users?search=&role=');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication token is required');
  });

  it('protects profile editing from unauthenticated access', async () => {
    const response = await request(app).put('/api/auth/me').send({
      name: 'Updated Name', email: 'updated@example.com',
    });
    expect(response.status).toBe(401);
  });

  it('protects password changes from unauthenticated access', async () => {
    const response = await request(app).put('/api/auth/password').send({
      currentPassword: 'OldPassword1', newPassword: 'NewPassword2',
    });
    expect(response.status).toBe(401);
  });
});
