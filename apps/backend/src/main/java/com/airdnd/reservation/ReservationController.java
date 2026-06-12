package com.airdnd.reservation;

import com.airdnd.auth.AuthMemberPrincipal;
import com.airdnd.reservation.dto.ReservationRequest;
import com.airdnd.reservation.dto.ReservationResponse;
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
    public ResponseEntity<Long> reservationRoom(@RequestBody ReservationRequest request) {
        Long reservationId = reservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationId);
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> reservationRoomsList(@AuthenticationPrincipal AuthMemberPrincipal principal) {
        List<ReservationResponse> reservation = reservationService.getGuestReservations(principal.getMemberId());
        return ResponseEntity.status(HttpStatus.OK).body(reservation);
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long reservationId,
                                                  @AuthenticationPrincipal AuthMemberPrincipal principal) {
        reservationService.cancelReservation(reservationId, principal.getMemberId());
        return ResponseEntity.noContent().build();
    }

}
