package com.airdnd.room.dto;

import java.math.BigDecimal;
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
)
{ }
