import { z } from 'zod';

const id = z.coerce.number().int().positive();
const reviewBody = z
  .object({
    rating: z.coerce.number().int().min(1).max(5),
    title: z.string().trim().min(2).max(120),
    comment: z.string().trim().min(10).max(1500),
  })
  .strict();
export const roomTypeReviewSchema = z.object({
  body: z.object({}),
  params: z.object({ roomTypeId: id }),
  query: z.object({}),
});
export const createReviewSchema = z.object({
  body: reviewBody,
  params: z.object({ bookingId: id }),
  query: z.object({}),
});
export const updateReviewSchema = z.object({
  body: reviewBody,
  params: z.object({ id }),
  query: z.object({}),
});
export const reviewIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id }),
  query: z.object({}),
});
