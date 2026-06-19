package com.airdnd.room;

import com.airdnd.room.dto.RoomRatingDto;
import com.airdnd.room.dto.RoomSearchRequestDto;
import com.airdnd.room.dto.RoomSummary;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface RoomQueryRepository{
    // 커서 페이지 한 장. 다음 페이지 존재 여부 판단을 위해 size + 1 개까지 가져온다.
    // now 는 PENDING 홀드 만료 판정 기준 시각(날짜 가용성 필터에서 사용).
    List<RoomSummary> findPage(RoomSearchRequestDto conditions, LocalDateTime now);

    // 현재 조건(영역+필터)에 매칭되는 전체 수("이 지역에 N곳" 안내용). 인덱스 백업 COUNT.
    long countInArea(RoomSearchRequestDto conditions, LocalDateTime now);

    RoomRatingDto findRatingByRoomId(Long roomId);

    Map<Long, RoomRatingDto> findRatingByRoomIds(List<Long> roomIds);
}
