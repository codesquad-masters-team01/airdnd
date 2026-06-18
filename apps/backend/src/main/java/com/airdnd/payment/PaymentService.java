package com.airdnd.payment;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.config.PaypalProperties;
import com.airdnd.payment.dto.CaptureResponse;
import com.airdnd.payment.dto.PaymentOrderRequest;
import com.airdnd.reservation.Reservation;
import com.airdnd.reservation.ReservationService;
import com.airdnd.reservation.event.ReservationConfirmedEvent;
import com.airdnd.room.Room;
import com.airdnd.room.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaypalClient paypalClient;
    private final PaypalProperties paypalProperties;
    private final ReservationService reservationService;
    private final RoomRepository roomRepository;
    private final ApplicationEventPublisher applicationEventPublisher;


    @Transactional
    public String createOrder(PaymentOrderRequest request, Long guestId) {
        // 결제 대상 예약(본인 소유 + 만료 전 PENDING)을 조회. 금액은 예약에서 가져온다(클라이언트 입력 불신).
        Reservation reservation = reservationService.getPayableHold(request.reservationId(), guestId);

        BigDecimal paypalAmount = BigDecimal.valueOf(reservation.getTotalPrice())
                .divide(paypalProperties.exchangeRate(), 2, RoundingMode.HALF_UP);

        // PayPal 주문 생성 → 받은 orderId 로 Payment 기록 (예약 id 로 연결)
        String orderId = paypalClient.createOrder(paypalAmount);

        Payment payment = Payment.builder()
                .paypalOrderId(orderId)
                .reservationId(reservation.getId())
                .paypalAmount(paypalAmount)
                .currency(paypalProperties.currency())
                .status(PaymentStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        return orderId;
    }

    @Transactional
    public CaptureResponse capture(String orderId, Long guestId) {
        Payment payment = paymentRepository.findByPaypalOrderId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        Reservation reservation = reservationService.findReservationById(payment.getReservationId());
        if (!reservation.getGuestId().equals(guestId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        if (payment.getStatus().equals(PaymentStatus.CAPTURED)) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_CAPTURED);
        }
        paypalClient.captureOrder(orderId);
        payment.markCaptured();
        paymentRepository.save(payment);

        reservation.confirm();
        reservationService.saveReservation(reservation);

        Room room = roomRepository.findById(reservation.getRoomId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        applicationEventPublisher.publishEvent(new ReservationConfirmedEvent(
                reservation.getId(),room.getHostId(),room.getName(),reservation.getCheckInDate(),reservation.getCheckOutDate()
        ));

        return new CaptureResponse(payment.getReservationId());
    }
}
