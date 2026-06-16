package com.airdnd.room;

import com.airdnd.room.dto.RoomRatingDto;
import com.airdnd.room.dto.RoomSearchRequestDto;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface RoomQueryRepository{
    List<Room> findByRoomSearchRequest(RoomSearchRequestDto conditions);

    RoomRatingDto findRatingByRoomId(Long roomId);

    Map<Long, RoomRatingDto> findRatingByRoomIds(List<Long> roomIds);
}
