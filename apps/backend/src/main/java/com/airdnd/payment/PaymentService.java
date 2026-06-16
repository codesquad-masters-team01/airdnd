package com.airdnd.payment;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.config.PaypalProperties;
import com.airdnd.payment.dto.PaymentOrderRequest;
import com.airdnd.reservation.ReservationService;
import com.airdnd.room.Room;
import com.airdnd.room.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import static java.time.temporal.ChronoUnit.DAYS;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final RoomRepository roomRepository;
    private final PaypalClient paypalClient;
    private final PaypalProperties paypalProperties;
    private final ReservationService  reservationService;


    @Transactional
    public String createOrder(PaymentOrderRequest request, Long guestId) {

        Room room = roomRepository.findById(request.roomId()).orElseThrow(
                () -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        int totalGuests = request.adultCount() + request.childCount();
        if (totalGuests > room.getMaxCapacity()) {
            throw new BusinessException(ErrorCode.ROOM_CAPACITY_EXCEEDED);
        }

        long nights = DAYS.between(request.checkInDate(), request.checkOutDate());
        if (nights <= 0) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED);
        }

        int krwTotal = room.getPricePerNight() * (int) nights;
        BigDecimal paypalAmount = BigDecimal.valueOf(krwTotal)
                .divide(paypalProperties.exchangeRate(), 2, RoundingMode.HALF_UP);

        // PayPal 주문 먼저 생성 → 받은 orderId 로 Payment 기록 (예약은 아직 X)
        String orderId = paypalClient.createOrder(paypalAmount);

        Payment payment = Payment.builder()
                .paypalOrderId(orderId)
                .guestId(guestId)
                .roomId(room.getId())
                .checkInDate(request.checkInDate())
                .checkOutDate(request.checkOutDate())
                .adultCount(request.adultCount())
                .childCount(request.childCount())
                .infantCount(request.infantCount())
                .hasPets(request.hasPets())
                .krwTotal(krwTotal)
                .paypalAmount(paypalAmount)
                .currency(paypalProperties.currency())
                .status("CREATED")
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        return orderId;
    }

    @Transactional
    public Long capture(String orderId, Long guestId) {
        Payment payment = paymentRepository.findByPaypalOrderId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getGuestId().equals(guestId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }
        if ("CAPTURED".equals(payment.getStatus())) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_CAPTURED);
        }

        paypalClient.captureOrder(orderId);

        Long reservationId = reservationService.createConfirmedReservation(
                payment.getGuestId(),
                payment.getRoomId(),
                payment.getCheckInDate(),
                payment.getCheckOutDate(),
                payment.getAdultCount(),
                payment.getChildCount(),
                payment.getInfantCount(),
                payment.isHasPets(),
                payment.getKrwTotal()
        );

        payment.markCaptured(reservationId);
        return reservationId;
    }
}

