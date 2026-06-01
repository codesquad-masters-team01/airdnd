import { z } from 'zod';

export const roomSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  region: z.string(),
  address: z.string(),
  pricePerNight: z.number(),
  rating: z.number(),
  reviewCount: z.number(),
  maxGuests: z.number(),
  imageUrl: z.string().url(),
  isAvailable: z.boolean(),
});

export const roomDetailSchema = roomSummarySchema.extend({
  description: z.string(),
  amenities: z.array(z.string()),
  hostName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export const roomSearchParamsSchema = z.object({
  region: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.number().optional(),
});

export type RoomSummary = z.infer<typeof roomSummarySchema>;
export type RoomDetail = z.infer<typeof roomDetailSchema>;
export type RoomSearchParams = z.infer<typeof roomSearchParamsSchema>;
