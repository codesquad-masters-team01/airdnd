package com.airdnd.payment;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * CAPTURING 으로 멈춘 결제를 주기적으로 찾아 건별로 정산(복구)한다.
 * 스케줄링·반복은 여기서, 건별 트랜잭션 로직은 PaymentReconciliationService 에서 담당한다
 * (별도 빈이라야 @Transactional 프록시가 건별로 적용됨). 한 건 실패가 전체 루프를 막지 않는다.
 */
@Component
@RequiredArgsConstructor
public class PaymentReconciliationSweeper {

    private static final Logger log = LoggerFactory.getLogger(PaymentReconciliationSweeper.class);
    // CAPTURING ㅅ ㅏㅇ 태로 3초 이상 지나면 문제있는 요청으로 필터함 API 요청이 지연될 경우 늘리거나
    // 근본적으로 락 자체를 유지하면 안됨
    private static final int STUCK_MINUTES = 3;

    private final PaymentRepository paymentRepository;
    private final PaymentReconciliationService reconciliationService;

    @Scheduled(fixedDelay = 60000)
    public void reconcileStuckCaptures() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(STUCK_MINUTES);
        List<Payment> stuck = paymentRepository.findByStatusAndUpdatedAtBefore(PaymentStatus.CAPTURING, threshold);
        if (stuck.isEmpty()) {
            return;
        }
        log.info("Reconciling {} stuck CAPTURING payment(s)", stuck.size());
        for (Payment payment : stuck) {
            try {
                reconciliationService.reconcileOne(payment.getId());
            } catch (Exception e) {
                log.error("Failed to reconcile payment {}: {}", payment.getId(), e.getMessage(), e);
            }
        }
    }
}
