package com.airdnd.reservation.dto;

import com.airdnd.reservation.Reservation;
import com.airdnd.reservation.ReservationStatus;
import com.airdnd.room.Room;

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
        Long totalPrice,
        ReservationStatus status,
        LocalDateTime expiresAt,
        LocalDateTime createdAt
)
{
    public static ReservationResponse from(Reservation reservation, Room room){
        return new ReservationResponse(
                reservation.getId(),
                reservation.getRoomId(),
                room.getName(),
                room.getRepresentativeImageUrl(),
                room.getRegion(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                room.getMaxCapacity(),
                room.getPricePerNight(),
                reservation.getTotalPrice(),
                reservation.getStatus(),
                reservation.getExpiresAt(),
                reservation.getCreatedAt()
        );
    }


}
