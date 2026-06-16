package com.airdnd.reservation;

import com.airdnd.reservation.dto.BookedDateRange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByRoomId(Long roomId);

    List<Reservation> findByGuestId(Long guestId);

    @Query("""
            SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
            FROM Reservation r
            WHERE r.roomId = :roomId
              AND r.status IN :statuses
              AND r.checkInDate < :newCheckOut
              AND r.checkOutDate > :newCheckIn
            """)
    boolean existsOverlappingReservation(@Param("roomId") Long roomId,
                                         @Param("statuses") Collection<String> statuses,
                                         @Param("newCheckIn") LocalDate newCheckIn,
                                         @Param("newCheckOut") LocalDate newCheckOut);

    @Query("""
            SELECT new com.airdnd.reservation.dto.BookedDateRange(r.checkInDate, r.checkOutDate)
            FROM Reservation r
            WHERE r.roomId = :roomId
              AND r.status IN :statuses
              AND r.checkOutDate > :fromDate
            ORDER BY r.checkInDate ASC
            """)
    List<BookedDateRange> findBookedRanges(@Param("roomId") Long roomId,
                                           @Param("statuses") Collection<String> statuses,
                                           @Param("fromDate") LocalDate fromDate);
}
