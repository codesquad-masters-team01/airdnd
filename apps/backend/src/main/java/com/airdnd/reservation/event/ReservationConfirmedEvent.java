package com.airdnd.reservation.event;

import java.time.LocalDate;

public record ReservationConfirmedEvent (
        Long reservationId,
        Long hostId,
        String roomName,
        LocalDate checkInDate,
        LocalDate checkOutDate
){ }
