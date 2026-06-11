package com.airdnd.room.dto;

import java.math.BigDecimal;

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

{ }
