package com.airdnd.room;

import com.airdnd.room.dto.RoomSearchRequestDTO;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class QDslRoomQueryRepository implements RoomQueryRepository{

    private final JPAQueryFactory factory;

    @Override
    public List<Room> findByRoomSearchRequest(RoomSearchRequestDTO conditions){

    }
}
