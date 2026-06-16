import { request } from '../../../shared/api/httpClient';
import {
  RoomDetail,
  RoomSearchParams,
  RoomSummary,
  roomDetailSchema,
  roomSummarySchema,
} from '../model/roomTypes';

// 백엔드 응답은 평균 평점을 averageRating(후기 없으면 null)으로 내려주지만,
// 프론트 도메인/스키마는 rating 을 사용합니다. 파싱 전에 키를 맞춰줍니다.
function withRating(raw: unknown) {
  if (raw && typeof raw === 'object' && 'averageRating' in raw) {
    const { averageRating, ...rest } = raw as Record<string, unknown>;
    return { ...rest, rating: averageRating ?? undefined };
  }
  return raw;
}

export async function getRooms(params: RoomSearchParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const data = await request<RoomSummary[]>(`/api/rooms${query ? `?${query}` : ''}`);
  return roomSummarySchema.array().parse(Array.isArray(data) ? data.map(withRating) : data);
}

export async function getRoom(roomId: number) {
  const data = await request<RoomDetail>(`/api/rooms/${roomId}`);
  return roomDetailSchema.parse(withRating(data));
}

export interface RoomUpdateRequest {
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  allowsInfants: boolean;
  allowsPets: boolean;
  amenities: string[];
  imageUrls: string[];
}

export async function updateRoom(roomId: number, input: RoomUpdateRequest) {
  const data = await request<RoomDetail>(`/api/rooms/${roomId}`, {
    method: 'PATCH',
    body: input,
  });
  return roomDetailSchema.parse(withRating(data));
}
