package com.airdnd.reservation;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ReservationController {

    @PostMapping("/api/reservations")
    public void reservationRoom() {
        reservationRoom();
    }

}
