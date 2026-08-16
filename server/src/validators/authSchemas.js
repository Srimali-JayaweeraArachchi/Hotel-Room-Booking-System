import { z } from 'zod';

const email = z.string().trim().email().max(255);
const password = z
  .string()
  .min(8)
  .max(72)
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number');

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(100),
      email,
      password,
    })
    .strict(),
  params: z.object({}),
  query: z.object({}),
});

export const loginSchema = z.object({
  body: z
    .object({
      email,
      password: z.string().min(1).max(72),
    })
    .strict(),
  params: z.object({}),
  query: z.object({}),
});

export const updateProfileSchema = z.object({
  body: z.object({ name: z.string().trim().min(2).max(100), email }).strict(),
  params: z.object({}),
  query: z.object({}),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1).max(72),
      newPassword: password,
    })
    .strict()
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from the current password',
      path: ['newPassword'],
    }),
  params: z.object({}),
  query: z.object({}),
});
