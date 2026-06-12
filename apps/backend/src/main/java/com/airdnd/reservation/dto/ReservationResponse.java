package com.airdnd.reservation.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationResponse (
        Long id,
        Long roomId,
        String roomName,
        String roomUrl,
        String region,
        LocalDate checkIn,
        LocalDate checkOut,
        Integer guests,
        Integer pricePerNight,
        Integer totalPrice,
        String status,
        LocalDateTime createdAt
)
{}
