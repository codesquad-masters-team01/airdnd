import { request } from '../../../shared/api/httpClient';
import {
  HostRoom,
  HostRoomFormInput,
  HostRoomStatus,
  hostRoomSchema,
} from '../model/hostRoomTypes';

export async function getHostRooms() {
  const data = await request<HostRoom[]>('/api/host/rooms');
  return hostRoomSchema.array().parse(data);
}

export async function getHostRoom(roomId: number) {
  const data = await request<HostRoom>(`/api/host/rooms/${roomId}`);
  return hostRoomSchema.parse(data);
}

export async function createHostRoom(input: HostRoomFormInput) {
  const data = await request<number>('/api/host/rooms', {
    method: 'POST',
    body: normalizeHostRoomPayload(input),
  });
  return data;
}

export async function updateHostRoom(roomId: number, input: HostRoomFormInput) {
  const data = await request<HostRoom>(`/api/host/rooms/${roomId}`, {
    method: 'PATCH',
    body: normalizeHostRoomPayload(input),
  });
  return hostRoomSchema.parse(data);
}

export async function updateHostRoomStatus(roomId: number, status: HostRoomStatus) {
  const data = await request<HostRoom>(`/api/host/rooms/${roomId}/status`, {
    method: 'PATCH',
    body: { status },
  });
  return hostRoomSchema.parse(data);
}

function normalizeHostRoomPayload(input: HostRoomFormInput) {
  return {
    name: input.name,
    region: input.region,
    address: input.address,
    description: input.description,
    pricePerNight: input.pricePerNight,
    maxGuests: input.maxGuests,
    imageUrl: input.imageUrl,
    imageUrls: splitCommaSeparatedValues(input.imageUrlsText),
    amenities: input.amenities,
    allowsInfants: input.allowsInfants ?? false,
    allowsPets: input.allowsPets ?? false,
    countryCode: input.countryCode,
    latitude: input.latitude,
    longitude: input.longitude,
  };
}

function splitCommaSeparatedValues(value?: string) {
  return value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
