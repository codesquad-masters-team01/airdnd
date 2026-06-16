package com.airdnd.wishlist.dto;

import com.airdnd.room.dto.RoomDetailResponse;
import com.airdnd.room.dto.RoomRatingDto;
import com.airdnd.room.dto.RoomResponse;
import com.airdnd.wishlist.Wishlist;
import com.airdnd.wishlist.WishlistRoom;

import java.util.List;
import java.util.Map;

public record WishlistResponse(
        Long id,
        String name,
        List<RoomDetailResponse> wishlistedRooms
) {
    public static WishlistResponse from(Wishlist wishlist, Map<Long, RoomRatingDto> rating) {
        List<RoomDetailResponse> rooms = wishlist.getRooms().stream()
                .map(WishlistRoom::getRoom)
                .map(room -> RoomDetailResponse.from(room, rating.get(room.getId())))
                .toList();
        return new WishlistResponse(wishlist.getId(), wishlist.getName(), rooms);
    }
}
