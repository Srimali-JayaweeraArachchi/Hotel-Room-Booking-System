import { describe, expect, it } from 'vitest';
import { createReviewSchema } from '../src/validators/reviewSchemas.js';

describe('review validation', () => {
  it('accepts a valid one-to-five-star review', () => {
    const result = createReviewSchema.safeParse({
      body: {
        rating: 5,
        title: 'Excellent stay',
        comment: 'The room was clean and comfortable.',
      },
      params: { bookingId: '1' },
      query: {},
    });
    expect(result.success).toBe(true);
  });

  it('rejects ratings outside the supported range', () => {
    const result = createReviewSchema.safeParse({
      body: {
        rating: 6,
        title: 'Invalid rating',
        comment: 'This rating should not be accepted.',
      },
      params: { bookingId: '1' },
      query: {},
    });
    expect(result.success).toBe(false);
  });
});
