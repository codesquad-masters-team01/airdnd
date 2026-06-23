import { z } from 'zod';
import { roomDetailSchema } from '../../rooms/model/roomTypes';

export const wishlistSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  roomCount: z.number(),
});

export const wishlistListSchema = z.object({
  wishlists: z.array(wishlistSummarySchema),
});

export const wishlistDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  wishlistedRooms: z.array(roomDetailSchema),
});

// 현재 로그인 회원이 (어느 폴더든) 위시리스트에 담은 방 id 집합. 카드 하트의 "저장됨(빨강)" 표시에 사용.
export const savedRoomIdsSchema = z.object({
  roomIds: z.array(z.number()),
});

// 특정 방이 담겨 있는 위시리스트(폴더) id 목록. 팝오버의 폴더별 체크 표시·토글에 사용.
export const roomWishlistIdsSchema = z.object({
  wishlistIds: z.array(z.number()),
});

export type WishlistSummary = z.infer<typeof wishlistSummarySchema>;
export type WishlistList = z.infer<typeof wishlistListSchema>;
export type WishlistDetail = z.infer<typeof wishlistDetailSchema>;
export type SavedRoomIds = z.infer<typeof savedRoomIdsSchema>;
export type RoomWishlistIds = z.infer<typeof roomWishlistIdsSchema>;
