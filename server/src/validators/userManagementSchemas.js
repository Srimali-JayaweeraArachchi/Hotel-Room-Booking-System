import { z } from 'zod';

const optionalQuery = (schema) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    schema.optional(),
  );

export const managedUserSearchSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    search: optionalQuery(z.string().trim().max(100)),
    role: optionalQuery(z.enum(['guest', 'staff', 'admin'])),
  }),
});

export const managedUserRoleSchema = z.object({
  body: z.object({ role: z.enum(['guest', 'staff']) }).strict(),
  params: z.object({ id: z.coerce.number().int().positive() }),
  query: z.object({}),
});
