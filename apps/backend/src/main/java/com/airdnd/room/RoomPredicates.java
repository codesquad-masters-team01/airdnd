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

// 숙소 검색 술어 모음. 목록(GET /api/rooms)과 지도(GET /api/rooms/map)가 동일한 필터/가용성
// 규칙을 공유하도록 한곳에 모은다. 각 메서드는 조건이 없으면 null 을 반환해 .where(...) 에서 무시된다.
public final class RoomPredicates {

    private RoomPredicates() {
    }

    // 항상 적용: 노출(active) + 미삭제.
    public static BooleanExpression visible() {
        return room.isActive.isTrue().and(room.isDeleted.isFalse());
    }

    public static BooleanExpression regionContains(String region) {
        return hasText(region) ? room.region.containsIgnoreCase(region) : null;
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

    // 날짜 가용성(하드 필터). checkIn/checkOut 이 둘 다 있을 때만 적용한다.
    // 점유 판정은 예약 시점(ReservationRepository.existsOverlappingReservation)과 동일하게:
    //   CONFIRMED 는 항상, PENDING 은 만료 전(expiresAt > now)일 때만 방을 막는다.
    // 겹침: 기존.checkIn < 요청.checkOut AND 기존.checkOut > 요청.checkIn.
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

    // 커서: 마지막으로 본 id 이후만. (정렬 기준이 id ASC 이므로 id > lastId)
    public static BooleanExpression cursorAfter(Long lastId) {
        return lastId == null ? null : room.id.gt(lastId);
    }
}
