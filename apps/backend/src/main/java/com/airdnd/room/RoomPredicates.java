package com.airdnd.room;

import com.airdnd.reservation.ReservationStatus;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static com.airdnd.reservation.QReservation.reservation;
import static com.airdnd.room.QRoom.room;
import static org.springframework.util.StringUtils.hasText;

public final class RoomPredicates {

    private RoomPredicates() {
    }

    public static BooleanExpression visible() {
        return room.isActive.isTrue().and(room.isDeleted.isFalse());
    }

    // Prefix match (region LIKE 'term%') so it can use idx_rooms_region. A leading
    // wildcard (containsIgnoreCase -> '%term%') or lower(region) would be non-sargable
    // and force a full table scan. The column's utf8mb4_unicode_ci collation keeps the
    // comparison case-insensitive without lower().
    public static BooleanExpression regionStartsWith(String region) {
        return hasText(region) ? room.region.startsWith(region) : null;
    }

    public static BooleanExpression priceBetween(Integer min, Integer max) {
        if (min == null && max == null) {
            return null;
        }
        if (max == null) {
            return room.pricePerNight.goe(min);
        }
        if (min == null) {
            return room.pricePerNight.loe(max);
        }
        return room.pricePerNight.between(min, max);
    }

    public static BooleanExpression isPetAllowed(Boolean allowsPets) {
        return allowsPets == null ? null : room.allowsPets.eq(allowsPets);
    }

    public static BooleanExpression withinMaxCapacity(Integer guests) {
        return guests == null ? null : room.maxCapacity.goe(guests);
    }

    public static BooleanExpression withinLatitude(BigDecimal south, BigDecimal north) {
        return (south == null || north == null) ? null : room.latitude.between(south, north);
    }

    public static BooleanExpression withinLongitude(BigDecimal west, BigDecimal east) {
        return (west == null || east == null) ? null : room.longitude.between(west, east);
    }

    public static BooleanExpression isInfantAllowed(Integer infants) {
        return (infants == null || infants == 0) ? null : room.allowsInfants.isTrue();
    }

    public static BooleanExpression available(LocalDate checkIn, LocalDate checkOut, LocalDateTime now) {
        if (checkIn == null || checkOut == null) {
            return null;
        }
        return JPAExpressions.selectOne()
                .from(reservation)
                .where(
                        reservation.roomId.eq(room.id),
                        reservation.status.in(ReservationStatus.CONFIRMED, ReservationStatus.PENDING),
                        reservation.status.ne(ReservationStatus.PENDING).or(reservation.expiresAt.gt(now)),
                        reservation.checkInDate.lt(checkOut),
                        reservation.checkOutDate.gt(checkIn)
                )
                .notExists();
    }

    public static BooleanExpression cursorAfter(Long lastId) {
        return lastId == null ? null : room.id.gt(lastId);
    }
}
