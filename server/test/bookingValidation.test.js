import { describe, expect, it } from 'vitest';
import { createBookingSchema } from '../src/validators/bookingSchemas.js';

const validBooking = {
  roomTypeId: 1,
  checkIn: '2030-01-10',
  checkInTime: '14:00',
  checkOut: '2030-01-12',
  checkOutTime: '11:00',
  guests: 2,
  specialRequests: '',
};

describe('booking date and time validation', () => {
  it('accepts valid booking dates with 24-hour times', () => {
    const result = createBookingSchema.safeParse({ body: validBooking, params: {}, query: {} });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid booking time', () => {
    const result = createBookingSchema.safeParse({
      body: { ...validBooking, checkInTime: '25:00' }, params: {}, query: {},
    });
    expect(result.success).toBe(false);
  });
});
