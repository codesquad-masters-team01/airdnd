package com.airdnd.reservation.event;

import java.time.LocalDate;

public record ReservationCancelledEvent (
        Long reservationId,
        Long hostId,
        String roomName,
        LocalDate checkInDate,
        LocalDate checkOutDate
){ }
