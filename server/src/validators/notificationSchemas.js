import { z } from 'zod';

export const notificationIdSchema = z.object({
  body: z.object({}), params: z.object({ id: z.coerce.number().int().positive() }), query: z.object({}),
});
