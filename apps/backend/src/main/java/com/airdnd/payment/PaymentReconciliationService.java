package com.airdnd.payment;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.reservation.ReservationService;
import com.airdnd.reservation.ReservationService.CaptureFinalizeResult;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentReconciliationService {

    private static final Logger log = LoggerFactory.getLogger(PaymentReconciliationService.class);
    private static final String PAYPAL_COMPLETED = "COMPLETED";

    private final PaymentRepository paymentRepository;
    private final PaypalClient paypalClient;
    private final ReservationService reservationService;

    /**
     * CAPTURING 으로 멈춘 결제 1건을 PayPal(진실 공급원)과 대조해 복구한다.
     * - PayPal COMPLETED: 실제 과금됨 → 예약 확정 시도 후 CAPTURED. 방을 줄 수 없으면 REFUND_REQUIRED.
     * - 그 외: 과금되지 않음 → FAILED 로 종료.
     * 중요: 이 경로는 절대 captureOrder 를 호출하지 않으므로 중복 과금이 발생할 수 없다.
     */
    @Transactional
    public void reconcileOne(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        if (payment.getStatus() != PaymentStatus.CAPTURING) {
            return; // 다른 실행/요청이 이미 처리함
        }

        String orderStatus = paypalClient.getOrderStatus(payment.getPaypalOrderId());
        if (!PAYPAL_COMPLETED.equals(orderStatus)) {
            // 과금된 적이 없음(승인만 됐거나 만료/취소) → 종료 처리
            payment.markFailed();
            log.info("Reconciled payment {} -> FAILED (PayPal order status={})", paymentId, orderStatus);
            return;
        }

        // 과금됨 → 방 점유 재검증 후 확정
        CaptureFinalizeResult result =
                reservationService.lockAndConfirmForReconciliation(payment.getReservationId());
        switch (result) {
            case CONFIRMED, ALREADY_CONFIRMED -> {
                payment.markCaptured();
                log.info("Reconciled payment {} -> CAPTURED (reservation {}, {})",
                        paymentId, payment.getReservationId(), result);
            }
            case UNFULFILLABLE -> {
                payment.markRefundRequired();
                log.error("Payment {} captured at PayPal but reservation {} is no longer fulfillable. REFUND REQUIRED.",
                        paymentId, payment.getReservationId());
            }
        }
    }
}
