package com.airdnd.room;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;


    @Transactional
    public Long registerRoom(HostRoomRequest request) {

        Long mockHostId = 1L; //TODO : oauth 완료시 실제 id 가져오기

        Room room = Room.builder()
                .hostId(mockHostId)
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .countryCode(request.getCountryCode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .pricePerNight(request.getPricePerNight())
                .maxCapacity(request.getMaxGuests())
                .allowsInfants(request.getAllowsInfants())
                .allowsPets(request.getAllowsPets())
                .build();

        RoomImage representativeImage = RoomImage.builder()
                .imageUrl(request.getImageUrl())
                .isRepresentative(true)
                .build();

        room.addRoomImage(representativeImage);

        Room saveRoom = roomRepository.save(room);

        return saveRoom.getId();
    }
}
