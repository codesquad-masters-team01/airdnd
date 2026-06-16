package com.airdnd.reservation;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.reservation.dto.BookedDateRange;
import com.airdnd.reservation.dto.ReservationRequest;
import com.airdnd.reservation.dto.ReservationResponse;
import com.airdnd.room.Room;
import com.airdnd.room.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final List<String> BLOCKING_STATUSES = List.of("CONFIRMED", "PENDING");

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public Long createReservation(Long memberId ,ReservationRequest request) {

        Room room = roomRepository.findByIdForUpdate(request.roomId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        if(!request.checkInDate().isBefore(request.checkOutDate())){
            throw new BusinessException(ErrorCode.INVALID_RESERVATION_DATE);
        }

        int totalGuests = request.adultCount() + request.childCount();

        if(totalGuests > room.getMaxCapacity()) {
            throw new BusinessException(ErrorCode.ROOM_CAPACITY_EXCEEDED);
        }

        boolean alreadyBooked = reservationRepository.existsOverlappingReservation(
                request.roomId(), BLOCKING_STATUSES, request.checkInDate(), request.checkOutDate());
        if(alreadyBooked){
            throw new BusinessException(ErrorCode.ROOM_ALREADY_BOOKED);
        }

        Reservation reservation = Reservation.fromRequest(memberId, request);

        Reservation savedReservation = reservationRepository.save(reservation);
        return savedReservation.getId();
    }

    @Transactional(readOnly = true)
    public List<BookedDateRange> getBookedRanges(Long roomId) {
        return reservationRepository.findBookedRanges(roomId, BLOCKING_STATUSES, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getGuestReservations(Long guestId) {
        List<Reservation> reservations = reservationRepository.findByGuestId(guestId);
        List<ReservationResponse> responses = new ArrayList<>();
        for(Reservation reservation : reservations) {
            Room room = roomRepository.findById(reservation.getRoomId()).orElseThrow(
                    () -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

            responses.add(new ReservationResponse(
                    reservation.getId(),
                    room.getId(),
                    room.getName(),
                    room.getRepresentativeImageUrl(),
                    room.getRegion(),
                    reservation.getCheckInDate(),
                    reservation.getCheckOutDate(),
                    reservation.getAdultCount() + reservation.getChildCount(),
                    room.getPricePerNight(),
                    reservation.getTotalPrice(),
                    reservation.getStatus(),
                    reservation.getCreatedAt()

            ));
        }
        return responses;
    }

    @Transactional
    public void cancelReservation(Long reservationId, Long guestId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
        if (!reservation.getGuestId().equals(guestId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }
        reservation.cancel();
    }

}
