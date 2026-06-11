package com.airdnd.room.dto;

import com.airdnd.room.Room;

import java.math.BigDecimal;
import java.util.List;

public record RoomResponse (

        Long id,
        String name,
        String region,
        String address,
        Integer pricePerNight,
        Integer maxGuests,
        String imageUrl,
        BigDecimal latitude,
        BigDecimal longitude,
        boolean isAvailable,
        boolean allowsPets
)
{
    public static RoomResponse from(Room room){
        return new RoomResponse(
                room.getId(),
                room.getName(),
                room.getRegion(),
                room.getAddress(),
                room.getPricePerNight(),
                room.getMaxCapacity(),
                room.getRepresentativeImageUrl(),
                room.getLatitude(),
                room.getLongitude(),
                room.getIsActive(),
                room.getAllowsPets()
        );
    }

    public static List<RoomResponse> fromList(List<Room> rooms){
        return rooms.stream().map(RoomResponse::from).toList();
    }
}
