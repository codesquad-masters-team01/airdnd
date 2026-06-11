import { z } from 'zod';

export const roomSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  region: z.string(),
  address: z.string(),
  pricePerNight: z.number(),
  maxGuests: z.number(),
  imageUrl: z.string().url().or(z.literal('')),
  isAvailable: z.boolean(),
  allowsPets: z.boolean(),
  // 지도 검색용 좌표. 백엔드 목록 응답(RoomResponse)이 추가하기 전까지는 없을 수 있어 optional 입니다.
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const roomDetailSchema = roomSummarySchema.extend({
  description: z.string(),
  amenities: z.array(z.string()),
  imageUrls: z.array(z.string().url()).optional(),
  hostName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  allowsInfants: z.boolean().optional().default(false),
});

export const roomSearchParamsSchema = z.object({
  region: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.number().optional(),
  adults: z.number().optional(),
  children: z.number().optional(),
  infants: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  allowsPets: z.boolean().optional(),
});

export type RoomSummary = z.infer<typeof roomSummarySchema>;
export type RoomDetail = z.infer<typeof roomDetailSchema>;
export type RoomSearchParams = z.infer<typeof roomSearchParamsSchema>;
