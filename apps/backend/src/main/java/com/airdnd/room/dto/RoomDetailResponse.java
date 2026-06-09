package com.airdnd.room.dto;

import java.math.BigDecimal;
import java.util.List;

public record RoomDetailResponse (
        Long id,
        String name,
        String region,
        String address,
        Integer pricePerNight,
        Integer maxGuests,
        String imageUrl,
        boolean isAvailable,
        boolean allowsPets,
        String description,
        List<String> amenities,
        List<String> imageUrls,
        String hostName,
        BigDecimal latitude,
        BigDecimal longitude
)
{ }
