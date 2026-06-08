package com.airdnd.room.dto;

import com.airdnd.room.Room;
import com.airdnd.room.RoomImage;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public record HostRoomResponse (
        Long id,
        String name,
        String region,
        String address,
        String description,
        Integer pricePerNight,
        Integer rating,
        Integer reviewCount,
        Integer maxGuests,
        String imageUrl,
        Boolean isAvailable,
        Boolean allowsPets,
        Boolean allowsInfants,
        List<String> amenities,
        String hostName,
        BigDecimal latitude,
        BigDecimal longitude,
        String status
) {
    public static HostRoomResponse from(Room room) {
        String imageUrl = room.getImages().isEmpty() ? "" : room.getImages().stream()
                .filter(RoomImage::getIsRepresentative)
                .findFirst()
                .map(RoomImage::getImageUrl)
                .orElse(room.getImages().get(0).getImageUrl());
        String status = room.getIsActive() ? "ACTIVE" : "INACTIVE";

        return new HostRoomResponse(
                room.getId(),
                room.getName(),
                room.getRegion(),
                room.getAddress(),
                room.getDescription(),
                room.getPricePerNight(),
                0, // 임시 더미 데이터 (rating)
                0, // 임시 더미 데이터 (reviewCount)
                room.getMaxCapacity(), // maxGuests 매핑
                imageUrl,
                room.getIsActive(), // isAvailable 매핑
                room.getAllowsPets(),
                room.getAllowsInfants(),
                new ArrayList<>(room.getAmenities()),
                "테스트 호스트", // 임시 더미 데이터 (hostName)
                room.getLatitude(),
                room.getLongitude(),
                status
        );
    }
}
