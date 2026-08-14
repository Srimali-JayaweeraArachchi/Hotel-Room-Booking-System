import { z } from 'zod';

const id = z.coerce.number().int().positive();
const stayBody = z.object({
  checkIn: z.iso.date(),
  checkInTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid check-in time'),
  checkOut: z.iso.date(),
  checkOutTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid check-out time'),
  guests: z.coerce.number().int().positive().max(20),
  specialRequests: z.string().trim().max(1000).optional().default(''),
}).strict();

export const createBookingSchema = z.object({
  body: stayBody.extend({ roomTypeId: id }), params: z.object({}), query: z.object({}),
});
export const updateBookingSchema = z.object({
  body: stayBody, params: z.object({ id }), query: z.object({}),
});
export const bookingIdSchema = z.object({ body: z.object({}), params: z.object({ id }), query: z.object({}) });
export const adminBookingSearchSchema = z.object({
  body: z.object({}), params: z.object({}), query: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'checked_in', 'completed']).optional(),
    search: z.string().trim().max(100).optional(),
  }),
});
export const bookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['confirmed', 'cancelled', 'checked_in', 'completed']),
    note: z.string().trim().max(500).optional().default(''),
  }).strict(),
  params: z.object({ id }), query: z.object({}),
});
