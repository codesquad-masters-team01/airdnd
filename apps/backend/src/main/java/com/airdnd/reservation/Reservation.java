package com.airdnd.reservation;


import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "reservations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    Long guestId;

    @Column(nullable = false)
    Long roomId;

    @Column(nullable = false)
    Date checkInDate;
    @Column(nullable = false)
    Date checkOutDate;

    @Column(nullable = false)
    BigDecimal totalPrice;

    @Column(nullable = false)
    int adultCount;

    @Column(nullable = false)
    int childCount;

    @Column(nullable = false)
    int infantCount;

    boolean hasPets;

    String status;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime deletedAt;
}
