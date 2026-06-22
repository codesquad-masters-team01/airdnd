package com.airdnd.room;

import com.airdnd.room.dto.RoomRatingDto;
import com.airdnd.room.dto.RoomSearchRequestDto;
import com.airdnd.room.dto.RoomSummary;
import com.querydsl.core.types.ConstructorExpression;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.airdnd.reservation.QReservation.reservation;
import static com.airdnd.review.QReview.review;
import static com.airdnd.room.QRoom.room;
import static com.airdnd.room.QRoomImage.roomImage;

@Repository
@RequiredArgsConstructor
public class RoomQueryRepositoryImpl implements RoomQueryRepository{

    private final JPAQueryFactory factory;

    @Override
    public List<RoomSummary> findPage(RoomSearchRequestDto conditions, LocalDateTime now){
        return factory.select(roomSummaryProjection())
                .from(room)
                .where(sharedFilters(conditions, now))
                .where(RoomPredicates.cursorAfter(conditions.cursorId()))
                .orderBy(room.id.asc())
                .limit(conditions.resolvedSize() + 1L)
                .fetch();
    }

    private ConstructorExpression<RoomSummary> roomSummaryProjection() {
        return Projections.constructor(RoomSummary.class,
                room.id,
                room.name,
                room.region,
                room.address,
                room.pricePerNight,
                room.maxCapacity,
                JPAExpressions.select(roomImage.imageUrl.max())
                        .from(roomImage)
                        .where(roomImage.room.eq(room), roomImage.isRepresentative.isTrue()),
                room.latitude,
                room.longitude,
                room.isActive,
                room.allowsPets);
    }

    private BooleanExpression[] sharedFilters(RoomSearchRequestDto c, LocalDateTime now) {
        return new BooleanExpression[]{
                RoomPredicates.regionContains(c.region()),
                RoomPredicates.priceBetween(c.minPrice(), c.maxPrice()),
                RoomPredicates.isPetAllowed(c.allowsPets()),
                RoomPredicates.withinMaxCapacity(c.guests()),
                RoomPredicates.withinLatitude(c.south(), c.north()),
                RoomPredicates.withinLongitude(c.west(), c.east()),
                RoomPredicates.isInfantAllowed(c.infants()),
                RoomPredicates.available(c.checkIn(), c.checkOut(), now),
                RoomPredicates.visible()
        };
    }

    @Override
    public long countInArea(RoomSearchRequestDto conditions, LocalDateTime now) {
        Long count = factory.select(room.count())
                .from(room)
                .where(sharedFilters(conditions, now))
                .fetchOne();
        return count == null ? 0L : count;
    }

    @Override
    public RoomRatingDto findRatingByRoomId(Long roomId) {
        return factory.select(Projections.constructor(RoomRatingDto.class,
                reservation.roomId,
                review.rating.avg(),
                review.count()))
                .from(review)
                .join(reservation).on(reservation.id.eq(review.reservationId))
                .where(
                        reservation.roomId.eq(roomId),
                        review.deletedAt.isNull()
                )
                .groupBy(reservation.roomId)
                .fetchOne();
    }

    @Override
    public Map<Long, RoomRatingDto> findRatingByRoomIds(List<Long> roomIds) {
        return factory.select(Projections.constructor(RoomRatingDto.class,
                reservation.roomId,
                review.rating.avg(),
                review.count()))
                .from(review)
                .join(reservation).on(reservation.id.eq(review.reservationId))
                .where(
                        reservation.roomId.in(roomIds),
                        review.deletedAt.isNull()
                )
                .groupBy(reservation.roomId)
                .fetch()
                .stream()
                .collect(Collectors.toMap(
                        RoomRatingDto::roomId,
                        dto->dto));
    }

}
