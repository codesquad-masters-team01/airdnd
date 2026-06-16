package com.airdnd.reservation;

import com.airdnd.auth.AuthMemberPrincipal;
import com.airdnd.reservation.dto.BookedDateRange;
import com.airdnd.reservation.dto.ReservationRequest;
import com.airdnd.reservation.dto.ReservationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;


    @PostMapping
    public ResponseEntity<Long> reservationRoom(@AuthenticationPrincipal AuthMemberPrincipal principal, @Valid @RequestBody ReservationRequest request) {
        Long reservationId = reservationService.createReservation(principal.getMemberId(),request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationId);
    }

    @GetMapping("/rooms/{roomId}/booked-dates")
    public ResponseEntity<List<BookedDateRange>> bookedDates(@PathVariable Long roomId) {
        return ResponseEntity.ok(reservationService.getBookedRanges(roomId));
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> reservationRoomsList(@AuthenticationPrincipal AuthMemberPrincipal principal) {
        List<ReservationResponse> reservation = reservationService.getGuestReservations(principal.getMemberId());
        return ResponseEntity.status(HttpStatus.OK).body(reservation);
    }

    @GetMapping("{reservationId}")
    public ResponseEntity<ReservationResponse> getReservationDetail(@AuthenticationPrincipal AuthMemberPrincipal principal, @PathVariable Long reservationId){
        ReservationResponse response = reservationService.findReservationResponseById(principal.getMemberId(), reservationId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long reservationId,
                                                  @AuthenticationPrincipal AuthMemberPrincipal principal) {
        reservationService.cancelReservation(reservationId, principal.getMemberId());
        return ResponseEntity.noContent().build();
    }

}
