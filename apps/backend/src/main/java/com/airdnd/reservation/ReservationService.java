package com.airdnd.reservation;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.reservation.dto.BookedDateRange;
import com.airdnd.reservation.dto.ReservationRequest;
import com.airdnd.reservation.dto.ReservationResponse;
import com.airdnd.reservation.event.ReservationCancelledEvent;
import com.airdnd.review.ReviewRepository;
import com.airdnd.room.Room;
import com.airdnd.room.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final List<ReservationStatus> BLOCKING_STATUSES =
            List.of(ReservationStatus.CONFIRMED, ReservationStatus.PENDING);

    private static final int HOLD_MINUTES = 1;

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final ReviewRepository reviewRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional
    public Long createReservation(Long memberId ,ReservationRequest request) {

        Room room = roomRepository.findByIdForUpdate(request.roomId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        if(!request.checkInDate().isBefore(request.checkOutDate())){
            throw new BusinessException(ErrorCode.INVALID_RESERVATION_DATE);
        }

        if (request.checkInDate().isBefore(LocalDate.now())) {
            throw new BusinessException(ErrorCode.INVALID_RESERVATION_DATE);
        }
        
        int totalGuests = request.adultCount() + request.childCount();

        if(totalGuests > room.getMaxCapacity()) {
            throw new BusinessException(ErrorCode.ROOM_CAPACITY_EXCEEDED);
        }


        if (request.hasPets() && !Boolean.TRUE.equals(room.getAllowsPets())) {
            throw new BusinessException(ErrorCode.PETS_NOT_ALLOWED);
        }
        if (request.infantCount() > 0 && !Boolean.TRUE.equals(room.getAllowsInfants())) {
            throw new BusinessException(ErrorCode.INFANTS_NOT_ALLOWED);
        }


        LocalDateTime now = LocalDateTime.now();

        boolean alreadyBooked = reservationRepository.existsOverlappingReservation(
                request.roomId(), BLOCKING_STATUSES, now, request.checkInDate(), request.checkOutDate());
        if(alreadyBooked){
            throw new BusinessException(ErrorCode.ROOM_ALREADY_BOOKED);
        }

        long nights = ChronoUnit.DAYS.between(request.checkInDate(), request.checkOutDate());
        long totalPrice = (long) room.getPricePerNight() * nights;
        LocalDateTime expiresAt = now.plusMinutes(HOLD_MINUTES);

        Reservation reservation = Reservation.createHold(memberId, request, totalPrice, expiresAt);

        Reservation savedReservation = reservationRepository.save(reservation);
        return savedReservation.getId();
    }

    @Transactional(readOnly = true)
    public List<BookedDateRange> getBookedRanges(Long roomId) {
        return reservationRepository.findBookedRanges(roomId, BLOCKING_STATUSES, LocalDate.now(), LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getGuestReservations(Long guestId) {
        List<Reservation> reservations = reservationRepository.findByGuestId(guestId);

        List<Long> reservationIds = reservations.stream().map(Reservation::getId).toList();
        Set<Long> reviewedIds = reservationIds.isEmpty()
                ? Set.of()
                : new HashSet<>(reviewRepository.findReservationIdsByReservationIdIn(reservationIds));

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
                    reservation.getExpiresAt(),
                    reservation.getCreatedAt(),
                    reviewedIds.contains(reservation.getId())
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
        boolean wasConfirmed = reservation.getStatus() == ReservationStatus.CONFIRMED;
        reservation.cancel();
        if(wasConfirmed){
            Room room = roomRepository.findById(reservation.getRoomId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));
            applicationEventPublisher.publishEvent(new ReservationCancelledEvent(
                    reservation.getId(), room.getHostId(), room.getName(),reservation.getCheckInDate(),
                    reservation.getCheckOutDate()
            ));
        }
    }

    @Transactional(readOnly = true)
    public Reservation getPayableHold(Long reservationId, Long guestId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
        if (!reservation.getGuestId().equals(guestId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }
        boolean payable = reservation.getStatus() == ReservationStatus.PENDING
                && reservation.getExpiresAt() != null
                && reservation.getExpiresAt().isAfter(LocalDateTime.now());
        if (!payable) {
            throw new BusinessException(ErrorCode.RESERVATION_NOT_PAYABLE);
        }
        return reservation;
    }


    @Transactional
    public ReservationResponse findReservationResponseById(Long memberId, Long reservationId){
        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
        if(!reservation.getGuestId().equals(memberId)){
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION, "본인의 예약 내역만 조회 가능합니다");
        }
        Room targetRoom = roomRepository.findById(reservation.getRoomId()).orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));
        return new ReservationResponse(
                reservation.getId(),
                reservation.getRoomId(),
                targetRoom.getName(),
                targetRoom.getRepresentativeImageUrl(),
                targetRoom.getRegion(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                targetRoom.getMaxCapacity(),
                targetRoom.getPricePerNight(),
                reservation.getTotalPrice(),
                reservation.getStatus(),
                reservation.getExpiresAt(),
                reservation.getCreatedAt(),
                reviewRepository.existsByReservationId(reservationId)
        );
    }

    public Reservation findReservationById(Long reservationId){
        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
        return reservation;
    }

    public Reservation saveReservation(Reservation reservation){
        return reservationRepository.save(reservation);
    }

}
