import { describe, expect, it } from 'vitest';
import { changePasswordSchema, updateProfileSchema } from '../src/validators/authSchemas.js';

describe('profile settings validation', () => {
  it('does not accept role changes in profile updates', () => {
    const result = updateProfileSchema.safeParse({
      body: { name: 'Hotel User', email: 'user@example.com', role: 'admin' }, params: {}, query: {},
    });
    expect(result.success).toBe(false);
  });

  it('requires a strong new password different from the current password', () => {
    const result = changePasswordSchema.safeParse({
      body: { currentPassword: 'SamePassword1', newPassword: 'SamePassword1' }, params: {}, query: {},
    });
    expect(result.success).toBe(false);
  });
});
