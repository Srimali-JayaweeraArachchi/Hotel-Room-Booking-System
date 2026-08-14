import { describe, expect, it, vi } from 'vitest';
import { authorize } from '../src/middleware/authenticate.js';
import { createRoleNotificationRecords } from '../src/repositories/notificationRepository.js';

describe('booking status role authorization', () => {
  it('rejects an administrator from a staff-only action', () => {
    const next = vi.fn();
    authorize('staff')({ user: { role: 'admin' } }, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403,
      message: 'You do not have permission for this action',
    }));
  });

  it('allows hotel staff to perform a staff-only action', () => {
    const next = vi.fn();
    authorize('staff')({ user: { role: 'staff' } }, {}, next);

    expect(next).toHaveBeenCalledWith();
  });
});

describe('operational notification recipients', () => {
  it('creates a separate notification for every active admin and staff account', async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce([[{ id: 4 }, { id: 7 }]])
      .mockResolvedValueOnce([{ insertId: 10 }])
      .mockResolvedValueOnce([{ insertId: 11 }]);

    await createRoleNotificationRecords({ execute }, {
      bookingId: 2, eventType: 'booking_created', title: 'New booking', message: 'A booking was created.',
    });

    expect(execute).toHaveBeenCalledTimes(3);
    expect(execute.mock.calls[0][1]).toEqual(['admin', 'staff']);
    expect(execute.mock.calls[1][1][0]).toBe(4);
    expect(execute.mock.calls[2][1][0]).toBe(7);
  });
});
