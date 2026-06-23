import { request } from '../../../shared/api/httpClient';
import {
  RoomWishlistIds,
  SavedRoomIds,
  WishlistDetail,
  WishlistList,
  roomWishlistIdsSchema,
  savedRoomIdsSchema,
  wishlistDetailSchema,
  wishlistListSchema,
} from '../model/wishlistTypes';

export async function getWishlists() {
  const data = await request<WishlistList>('/api/wishlist');
  return wishlistListSchema.parse(data).wishlists;
}

export async function getWishlist(wishlistId: number) {
  const data = await request<WishlistDetail>(`/api/wishlist/${wishlistId}`);
  return wishlistDetailSchema.parse(data);
}

export async function getSavedRoomIds() {
  const data = await request<SavedRoomIds>('/api/wishlist/saved-room-ids');
  return savedRoomIdsSchema.parse(data).roomIds;
}

// 이 방이 담겨 있는 위시리스트(폴더) id 목록. 팝오버 폴더별 체크 표시용.
export async function getWishlistIdsForRoom(roomId: number) {
  const data = await request<RoomWishlistIds>(`/api/wishlist/rooms/${roomId}/wishlist-ids`);
  return roomWishlistIdsSchema.parse(data).wishlistIds;
}

export async function addRoomToWishlist(wishlistId: number, roomId: number) {
  await request<void>(`/api/wishlist/${wishlistId}/rooms`, {
    method: 'POST',
    body: { roomId },
  });
}

export async function createWishlist(name: string) {
  await request<void>('/api/wishlist', {
    method: 'POST',
    body: { name },
  });
}

// 특정 폴더에서만 방 제거(폴더별 토글 해제). 멱등(없어도 204).
export async function removeRoomFromWishlistFolder(wishlistId: number, roomId: number) {
  await request<void>(`/api/wishlist/${wishlistId}/rooms/${roomId}`, {
    method: 'DELETE',
  });
}
