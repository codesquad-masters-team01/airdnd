package com.airdnd.reservation;

import com.airdnd.reservation.dto.BookedDateRange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByRoomId(Long roomId);

    List<Reservation> findByGuestId(Long guestId);

    // 점유 판정: CONFIRMED 는 항상, PENDING 은 만료 전(expiresAt > now)일 때만 방을 막는다.
    // 만료된 PENDING 홀드는 별도 정리 작업 없이도 즉시 점유에서 제외된다(지연 만료).
    @Query("""
            SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
            FROM Reservation r
            WHERE r.roomId = :roomId
              AND r.status IN :statuses
              AND (r.status <> com.airdnd.reservation.ReservationStatus.PENDING OR r.expiresAt > :now)
              AND r.checkInDate < :newCheckOut
              AND r.checkOutDate > :newCheckIn
            """)
    boolean existsOverlappingReservation(@Param("roomId") Long roomId,
                                         @Param("statuses") Collection<ReservationStatus> statuses,
                                         @Param("now") LocalDateTime now,
                                         @Param("newCheckIn") LocalDate newCheckIn,
                                         @Param("newCheckOut") LocalDate newCheckOut);

    @Query("""
            SELECT new com.airdnd.reservation.dto.BookedDateRange(r.checkInDate, r.checkOutDate)
            FROM Reservation r
            WHERE r.roomId = :roomId
              AND r.status IN :statuses
              AND (r.status <> com.airdnd.reservation.ReservationStatus.PENDING OR r.expiresAt > :now)
              AND r.checkOutDate > :fromDate
            ORDER BY r.checkInDate ASC
            """)
    List<BookedDateRange> findBookedRanges(@Param("roomId") Long roomId,
                                           @Param("statuses") Collection<ReservationStatus> statuses,
                                           @Param("fromDate") LocalDate fromDate,
                                           @Param("now") LocalDateTime now);

    @Modifying(clearAutomatically = true)
    @Query(""" 
            UPDATE Reservation r SET r.status = com.airdnd.reservation.ReservationStatus.CANCELLED,
            r.updatedAt = :now,
            r.deletedAt = :now
            WHERE r.status = com.airdnd.reservation.ReservationStatus.PENDING AND r.expiresAt < :now
            """)
    int bulkCancelExpiredReservations(@Param("now") LocalDateTime now);



    @Query("""
            SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
            FROM Reservation r
            WHERE r.roomId = :roomId
              AND r.id <> :currentId
              AND r.status IN :statuses
              AND (r.status <> com.airdnd.reservation.ReservationStatus.PENDING OR r.expiresAt > :now)
              AND r.checkInDate < :newCheckOut
              AND r.checkOutDate > :newCheckIn
            """)
    boolean existsOverlappingReservationExcludeCurrentId(@Param("roomId") Long roomId,
                                                         @Param("statuses") Collection<ReservationStatus> statuses,
                                                         @Param("now") LocalDateTime now,
                                                         @Param("newCheckIn") LocalDate newCheckIn,
                                                         @Param("newCheckOut") LocalDate newCheckOut,
                                                         @Param("currentId") Long currentId
    );
}
