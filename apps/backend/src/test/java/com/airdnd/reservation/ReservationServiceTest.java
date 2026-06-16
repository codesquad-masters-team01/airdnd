package com.airdnd.reservation;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.reservation.dto.ReservationRequest;
import com.airdnd.room.Room;
import com.airdnd.room.RoomRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @InjectMocks
    private ReservationService reservationService;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RoomRepository roomRepository;

    private static final Long MEMBER_ID = 9002L;
    private static final Long ROOM_ID = 1L;

    private ReservationRequest request(LocalDate checkIn, LocalDate checkOut) {
        return new ReservationRequest(
                ROOM_ID, checkIn, checkOut,
                300000, 2, 0, 0, false);
    }

    private Room roomWithCapacity(int capacity) {
        Room room = Room.builder().maxCapacity(capacity).build();
        ReflectionTestUtils.setField(room, "id", ROOM_ID);
        return room;
    }

    @Test
    @DisplayName("겹치는 예약이 없으면 잠금을 잡고 예약이 저장된다.")
    void createReservation_success_whenNoOverlap() {
        // given
        ReservationRequest request = request(LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 3));
        given(roomRepository.findByIdForUpdate(ROOM_ID)).willReturn(Optional.of(roomWithCapacity(4)));
        given(reservationRepository.existsOverlappingReservation(eq(ROOM_ID), anyCollection(), any(), any()))
                .willReturn(false);

        Reservation saved = Reservation.fromRequest(MEMBER_ID, request);
        ReflectionTestUtils.setField(saved, "id", 100L);
        given(reservationRepository.save(any(Reservation.class))).willReturn(saved);

        // when
        Long id = reservationService.createReservation(MEMBER_ID, request);

        // then
        assertThat(id).isEqualTo(100L);
        verify(roomRepository).findByIdForUpdate(ROOM_ID); // 잠금 경로로 조회했는지 확인
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    @DisplayName("겹치는 예약이 있으면 ROOM_ALREADY_BOOKED 로 거절되고 저장하지 않는다.")
    void createReservation_rejected_whenOverlap() {
        // given
        ReservationRequest request = request(LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 3));
        given(roomRepository.findByIdForUpdate(ROOM_ID)).willReturn(Optional.of(roomWithCapacity(4)));
        given(reservationRepository.existsOverlappingReservation(eq(ROOM_ID), anyCollection(), any(), any()))
                .willReturn(true);

        // when & then
        assertThatThrownBy(() -> reservationService.createReservation(MEMBER_ID, request))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getCode())
                .isEqualTo(ErrorCode.ROOM_ALREADY_BOOKED);

        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("체크인이 체크아웃보다 늦거나 같으면 INVALID_RESERVATION_DATE 로 거절된다.")
    void createReservation_rejected_whenInvalidDate() {
        // given : checkIn == checkOut (0박)
        ReservationRequest request = request(LocalDate.of(2026, 7, 3), LocalDate.of(2026, 7, 3));
        given(roomRepository.findByIdForUpdate(ROOM_ID)).willReturn(Optional.of(roomWithCapacity(4)));

        // when & then
        assertThatThrownBy(() -> reservationService.createReservation(MEMBER_ID, request))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getCode())
                .isEqualTo(ErrorCode.INVALID_RESERVATION_DATE);

        verify(reservationRepository, never()).existsOverlappingReservation(any(), anyCollection(), any(), any());
        verify(reservationRepository, never()).save(any());
    }
}
