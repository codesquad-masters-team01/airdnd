package com.airdnd.payment;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * capture 시도 직전에 결제를 CAPTURING 으로 내구 기록한다.
 * REQUIRES_NEW 로 별도 트랜잭션에서 커밋하므로, 이후 본 capture 트랜잭션이 롤백돼도
 * 이 마커는 남는다. 정산기(PaymentReconciliationService)가 이 마커를 진실 공급원(PayPal)과
 * 대조해 "결제됐지만 확정 못 됨" 상태를 복구한다.
 *
 * 별도 빈으로 둔 이유: 같은 빈 내부 호출은 Spring 프록시를 거치지 않아 REQUIRES_NEW 가 무시된다.
 */
@Component
@RequiredArgsConstructor
public class PaymentCaptureMarker {

    private final PaymentRepository paymentRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markCapturing(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        payment.markCapturing();
    }
}
