package com.airdnd.reservation;


import com.airdnd.reservation.dto.ReservationRequest;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "reservations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long guestId;

    @Column(nullable = false)
    private Long roomId;

    @Column(nullable = false)
    private LocalDate checkInDate;
    @Column(nullable = false)
    private LocalDate checkOutDate;

    // KRW 총액. 서버가 room.pricePerNight × 박수로 계산한다. (원화는 소수 단위가 없어 BIGINT/Long)
    @Column(nullable = false)
    private Long totalPrice;

    @Column(nullable = false)
    private int adultCount;

    @Column(nullable = false)
    private int childCount;

    @Column(nullable = false)
    private int infantCount;

    private boolean hasPets;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status;

    // PENDING 홀드 만료 시각. 이 시각 이후의 PENDING 은 점유로 보지 않는다(결제 미완료 자동 해제).
    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    @Builder
    private Reservation(Long id, Long guestId, Long roomId, LocalDate checkInDate, LocalDate checkOutDate, Long totalPrice,
                        int adultCount, int childCount, int infantCount,
                        boolean hasPets, ReservationStatus status, LocalDateTime expiresAt, LocalDateTime createdAt,
                        LocalDateTime updatedAt, LocalDateTime deletedAt) {
        this.id = id;
        this.guestId = guestId;
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.totalPrice = totalPrice;
        this.adultCount = adultCount;
        this.childCount = childCount;
        this.infantCount = infantCount;
        this.hasPets = hasPets;
        this.status = status;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    public void cancel() {
        this.status = ReservationStatus.CANCELLED;
        this.deletedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void confirm() {
        this.status = ReservationStatus.CONFIRMED;
        this.expiresAt = null;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 결제 대기(PENDING) 홀드를 만든다. 금액과 만료 시각은 서버가 계산해 넘긴다.
     * (totalPrice 를 클라이언트 입력으로 받지 않는다 — 가격 위변조 방지)
     */
    public static Reservation createHold(Long memberId, ReservationRequest request, long totalPrice, LocalDateTime expiresAt) {
        return Reservation.builder()
                .guestId(memberId)
                .roomId(request.roomId())
                .checkInDate(request.checkInDate())
                .checkOutDate(request.checkOutDate())
                .totalPrice(totalPrice)
                .adultCount(request.adultCount())
                .childCount(request.childCount())
                .infantCount(request.infantCount())
                .hasPets(request.hasPets())
                .status(ReservationStatus.PENDING)
                .expiresAt(expiresAt)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
