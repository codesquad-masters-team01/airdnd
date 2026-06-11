package com.airdnd.room;

import com.airdnd.room.dto.RoomSearchRequestDTO;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

import static com.airdnd.room.QRoom.room;
import static org.springframework.util.StringUtils.hasText;

@Repository
@RequiredArgsConstructor
public class RoomQueryRepositoryImpl implements RoomQueryRepository{

    private final JPAQueryFactory factory;

    @Override
    public List<Room> findByRoomSearchRequest(RoomSearchRequestDTO conditions){
        return factory.selectFrom(room)
                .where(
                    regionContains(conditions.region()),
                    priceBetween(conditions.minPrice(),conditions.maxPrice()),
                    isPetAllowed(conditions.allowsPets()),
                    withInMaxCapacity(conditions.guests()),
                    withinLatitude(conditions.south(), conditions.north()),
                    withinLongitude(conditions.west(), conditions.east()),
                    isInfantAllowed(conditions.infants()),
                    room.isActive.isTrue(),
                    room.isDeleted.isFalse()
                ).limit(conditions.resolvedLimit()).fetch();
    }

    private BooleanExpression regionContains(String region){
        if(!hasText(region)){
            return null;
        }
        return room.region.containsIgnoreCase(region);
    }
    private BooleanExpression priceBetween(Integer min, Integer max){
        if(min == null && max == null){
            return null;
        }
        if(min != null && max == null){
            return room.pricePerNight.goe(min);
        }
        if(min == null && max != null){
            return room.pricePerNight.loe(max);
        }
        return room.pricePerNight.between(min, max);
    }

    private BooleanExpression isPetAllowed(Boolean allowsPets){
        if(allowsPets == null){
            return null;
        }
        return room.allowsPets.eq(allowsPets);
    }

    private BooleanExpression withInMaxCapacity(Integer guests){
        if(guests == null){
            return null;
        }
        return room.maxCapacity.goe(guests);
    }

    private BooleanExpression withinLatitude(BigDecimal south, BigDecimal north){
        if(south == null || north == null){
            return null;
        }
        return room.latitude.between(south, north);
    }

    private BooleanExpression withinLongitude(BigDecimal west, BigDecimal east){
        if(west == null || east == null){
            return null;
        }
        return room.longitude.between(west, east);
    }

    private BooleanExpression isInfantAllowed(Integer infants){
        if(infants == null || infants.equals(0)){
            return null;
        }
        else{
            return room.allowsInfants.isTrue();
        }
    }
}
