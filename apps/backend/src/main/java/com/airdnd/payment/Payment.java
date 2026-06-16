package com.airdnd.payment;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String paypalOrderId;

    @Column(nullable = false)
    private Long guestId;

    @Column(nullable = false)
    private Long roomId;

    @Column(nullable = false)
    private LocalDate checkInDate;
    @Column(nullable = false)
    private LocalDate checkOutDate;

    @Column(nullable = false)
    private int adultCount;

    @Column(nullable = false)
    private int childCount;

    @Column(nullable = false)
    private int infantCount;

    @Column(nullable = false)
    private boolean hasPets;

    @Column(nullable = false)
    private int krwTotal;

    @Column(nullable = false)
    private BigDecimal paypalAmount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private String status;

    private Long reservationId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder
    private Payment(String paypalOrderId, Long guestId, Long roomId, LocalDate checkInDate, LocalDate checkOutDate,
                    int adultCount, int childCount, int infantCount, boolean hasPets, int krwTotal,
                    BigDecimal paypalAmount, String currency, String status, LocalDateTime createdAt) {
        this.paypalOrderId = paypalOrderId;
        this.guestId = guestId;
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.adultCount = adultCount;
        this.childCount = childCount;
        this.infantCount = infantCount;
        this.hasPets = hasPets;
        this.krwTotal = krwTotal;
        this.paypalAmount = paypalAmount;
        this.currency = currency;
        this.status = status;
        this.createdAt = createdAt;
    }

    public void markCaptured(Long reservationId) {
        this.status = "CAPTURED";
        this.reservationId = reservationId;
        this.updatedAt = LocalDateTime.now();
    }
}
