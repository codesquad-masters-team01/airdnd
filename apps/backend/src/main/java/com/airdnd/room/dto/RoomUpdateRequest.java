package com.airdnd.room.dto;

import java.math.BigDecimal;
import java.util.List;

public record RoomUpdateRequest (

        String name,
        String description,
        Integer pricePerNight,
        Integer maxGuests,
        Boolean allowsInfants,
        Boolean allowsPets,
        List<String> amenities,
        List<String> imageUrls

){ }

