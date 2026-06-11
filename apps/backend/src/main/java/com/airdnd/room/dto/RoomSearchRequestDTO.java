package com.airdnd.room.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;
import java.util.stream.Stream;

public record RoomSearchRequestDTO(
        String region,
        LocalDate checkIn,
        LocalDate checkOut,
        @Min(1)
        @Max(16)
        Integer guests,
        @Min(1)
        @Max(8)
        Integer adults,
        Integer children,
        Integer infants,
        Integer minPrice,
        Integer maxPrice,
        Boolean allowedPets,
        @DecimalMin("-90")
        @DecimalMax("90")
        BigDecimal south,
        @DecimalMin("-180")
        @DecimalMax("180")
        BigDecimal west,
        @DecimalMin("-90")
        @DecimalMax("90")
        BigDecimal north,
        @DecimalMin("-180")
        @DecimalMax("180")
        BigDecimal east,
        @Min(1)@Max(500)
        Integer limit
) {
    @AssertTrue(message = "지도 경계 좌표는 모두 함께 전달해야 합니다.")
    public boolean hasCompleteBounds() {
        long count = Stream.of(south, west, north, east)
                .filter(Objects::nonNull)
                .count();

        return count == 0 || count == 4;
    }

    @AssertTrue(message = "south는 north보다 작거나 같아야 합니다.")
    public boolean hasValidLatitudeOrder() {
        return south == null || north == null || south.compareTo(north) <= 0;
    }

    public int resolvedLimit() {
        return limit == null ? 200 : limit;
    }
}