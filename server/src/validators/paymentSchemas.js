// Payment module — request validation

import { z } from 'zod';

const bookingId = z.coerce.number().int().positive();
export const paymentListSchema = z.object({ body: z.object({}), params: z.object({ bookingId }), query: z.object({}) });
export const paymentCreateSchema = z.object({
  body: z.object({
    paymentToken: z.enum(['tok_prototype_approved', 'tok_prototype_declined']),
    method: z.enum(['card']),
  }).strict(),
  params: z.object({ bookingId }), query: z.object({}),
});
