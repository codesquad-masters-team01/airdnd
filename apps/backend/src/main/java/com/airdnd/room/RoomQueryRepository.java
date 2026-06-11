package com.airdnd.room;

import com.airdnd.room.dto.RoomSearchRequestDTO;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomQueryRepository{
    public List<Room> findByRoomSearchRequest(RoomSearchRequestDTO conditions);
}
