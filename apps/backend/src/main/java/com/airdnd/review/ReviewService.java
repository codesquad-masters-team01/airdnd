package com.airdnd.review;


import com.airdnd.auth.AuthMemberPrincipal;
import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.reservation.Reservation;
import com.airdnd.reservation.ReservationRepository;
import com.airdnd.reservation.ReservationStatus;
import com.airdnd.review.dto.ReviewRequest;
import com.airdnd.review.dto.ReviewResponse;
import com.airdnd.user.Member;
import com.airdnd.user.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsRoomId(Long roomId) {
        List<Reservation> reservations = reservationRepository.findByRoomId(roomId);
        List<ReviewResponse> reviews = new ArrayList<>();
        for (Reservation reservation : reservations) {
            List<Review> reservationReviews = reviewRepository.findByReservationId(reservation.getId());
            for (Review review : reservationReviews) {
                reviews.add(ReviewResponse.from(review));
            }
        }
        return reviews;
    }

    @Transactional
    public ReviewResponse createReview(Long reservationId, Long memberId, ReviewRequest request) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));

        if(!memberId.equals(reservation.getGuestId())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new BusinessException(ErrorCode.REVIEW_NOT_ELIGIBLE);
        }
        if (!reservation.getCheckOutDate().isBefore(LocalDate.now())) {
            throw new BusinessException(ErrorCode.REVIEW_NOT_ELIGIBLE);
        }

        if (reviewRepository.existsByReservationId(reservationId)) {
            throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Member member = memberRepository.getReferenceById(memberId);
        Review review = reviewRepository.save(Review.create(reservationId, member, request));
        return ReviewResponse.from(review);
    }
}
