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
        // TODO(feat-google-maps): QueryDSL 기반 지도 영역(bbox) 검색 구현 필요.
        // 병합 시점에 미완성 스텁이라 컴파일을 위해 빈 결과를 반환하도록 임시 처리함.
        return List.of();
    }
}
