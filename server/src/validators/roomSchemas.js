import { z } from 'zod';

const identifier = z.coerce.number().int().positive();
const emptyParams = z.object({});

export const publicRoomSearchSchema = z.object({
  body: z.object({}),
  params: emptyParams,
  query: z
    .object({
      search: z.string().trim().max(100).optional(),
      guests: z.coerce.number().int().positive().max(20).optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().nonnegative().optional(),
      checkIn: z.iso.date().optional(),
      checkOut: z.iso.date().optional(),
    })
    .refine(
      (query) =>
        query.minPrice === undefined ||
        query.maxPrice === undefined ||
        query.minPrice <= query.maxPrice,
      { message: 'Minimum price cannot be greater than maximum price' },
    )
    .refine((query) => Boolean(query.checkIn) === Boolean(query.checkOut), {
      message: 'Check-in and check-out dates must be supplied together',
    })
    .refine(
      (query) =>
        !query.checkIn || !query.checkOut || query.checkOut > query.checkIn,
      { message: 'Check-out must be after check-in' },
    ),
});

export const idParamSchema = z.object({
  body: z.object({}),
  params: z.object({ id: identifier }),
  query: z.object({}),
});

export const imageParamSchema = z.object({
  body: z.object({}),
  params: z.object({ id: identifier, imageId: identifier }),
  query: z.object({}),
});

const roomTypeBody = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().min(10).max(2000),
    basePrice: z.coerce.number().nonnegative().max(10000000),
    capacity: z.coerce.number().int().positive().max(20),
    bedType: z.string().trim().min(2).max(80),
    amenities: z.array(z.string().trim().min(1).max(80)).max(30),
    imageUrl: z
      .union([
        z.url().max(1000),
        z
          .string()
          .regex(
            /^\/rooms\/[A-Za-z0-9._/-]+$/,
            'Use an HTTPS URL or a /rooms/... local path',
          )
          .max(1000),
        z.literal(''),
      ])
      .optional(),
  })
  .strict();

export const roomTypeMutationSchema = z.object({
  body: roomTypeBody,
  params: z.object({ id: identifier.optional() }),
  query: z.object({}),
});

const roomBody = z
  .object({
    roomNumber: z.string().trim().min(1).max(20),
    roomTypeId: identifier,
    floor: z.coerce.number().int().min(-5).max(200),
    status: z.enum(['available', 'maintenance', 'inactive']),
    notes: z.string().trim().max(500).optional().default(''),
  })
  .strict();

export const roomMutationSchema = z.object({
  body: roomBody,
  params: z.object({ id: identifier.optional() }),
  query: z.object({}),
});

export const inventoryRoomSearchSchema = z.object({
  body: z.object({}),
  params: emptyParams,
  query: z.object({
    roomTypeId: identifier.optional(),
    status: z.enum(['available', 'maintenance', 'inactive']).optional(),
  }),
});
