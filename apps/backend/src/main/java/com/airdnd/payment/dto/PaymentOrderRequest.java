package com.airdnd.payment.dto;

import java.time.LocalDate;

public record PaymentOrderRequest(
        Long roomId,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        int adultCount,
        int childCount,
        int infantCount,
        boolean hasPets
) { }
