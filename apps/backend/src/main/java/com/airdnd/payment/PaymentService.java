package com.airdnd.payment;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.config.PaypalProperties;
import com.airdnd.payment.dto.CaptureResponse;
import com.airdnd.payment.dto.PaymentOrderRequest;
import com.airdnd.reservation.Reservation;
import com.airdnd.reservation.ReservationService;
import lombok.RequiredArgsConstructor;
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
    private final PaymentCaptureMarker paymentCaptureMarker;


    @Transactional
    public String createOrder(PaymentOrderRequest request, Long guestId) {
        // 결제 대상 예약을 조회
        Reservation reservation = reservationService.getPayableHold(request.reservationId(), guestId);

        BigDecimal paypalAmount = BigDecimal.valueOf(reservation.getTotalPrice())
                .divide(paypalProperties.exchangeRate(), 2, RoundingMode.HALF_UP);

        // PayPal 주문 생성하고 받은 orderId 로 Payment 기록 (예약 id 로 연결)
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

        // 결제 전에 방 점유를 다시 검증한다
        // 충돌 시 여기서 결제 방지함ㅇ
        reservationService.lockAndPrepareForCapture(reservation);

        // 과금 직전에 CAPTURING 을 별도 트랜잭션으로 내구 기록한다.
        // 이후 본 트랜잭션이 PayPal 과금 후 커밋에 실패하더라도, 이 마커가 남아
        // 정산기가 "결제됐지만 미확정"을 복구할 수 있다(과금 유실 방지).
        paymentCaptureMarker.markCapturing(payment.getId());


        // TODO: API 요청이 온갖 트랜잭션이랑 같이 묶여있음 + 룸이 위에서 락 된 이후 몇초가량 잠길 가능성이 높다
        // 동시 요청이 더 많아질 경우 현재 트랜잭션을 분해하거나 락 방식에 변경 필요함
        // 아직 얼마나 락이 오래 걸릴지 동시 요청으로 테스트 못해봄 감안
        paypalClient.captureOrder(orderId);
        payment.markCaptured();
        paymentRepository.save(payment);

        reservation.confirm();
        reservationService.saveReservation(reservation);
        return new CaptureResponse(payment.getReservationId());
    }
}
