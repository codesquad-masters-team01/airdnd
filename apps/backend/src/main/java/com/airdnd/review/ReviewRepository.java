package com.airdnd.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository <Review, Long> {

    List<Review> findByReservationId(Long reservationId);

    boolean existsByReservationId(Long reservationId);

    @Query("select r.reservationId from Review r where r.reservationId in :ids")
    List<Long> findReservationIdsByReservationIdIn(List<Long> ids);

}

