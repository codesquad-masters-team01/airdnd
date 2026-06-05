package com.airdnd.room;

import com.airdnd.room.dto.HostRoomRequest;
import com.airdnd.room.dto.HostRoomResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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
                .region(request.getRegion())
                .description(request.getDescription())
                .address(request.getAddress())
                .countryCode(request.getCountryCode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .pricePerNight(request.getPricePerNight())
                .maxCapacity(request.getMaxGuests())
                .allowsInfants(request.getAllowsInfants())
                .allowsPets(request.getAllowsPets())
                .amenities(request.getAmenities())
                .build();

        RoomImage representativeImage = RoomImage.builder()
                .imageUrl(request.getImageUrl())
                .isRepresentative(true)
                .build();

        room.addRoomImage(representativeImage);

        if (request.getImageUrls() != null) {
            for (String additionalImageUrl : request.getImageUrls()) {
                RoomImage additionalImage = RoomImage.builder()
                        .imageUrl(additionalImageUrl)
                        .isRepresentative(false)
                        .build();
                room.addRoomImage(additionalImage);
            }
        }

        Room saveRoom = roomRepository.save(room);

        return saveRoom.getId();
    }

    @Transactional(readOnly = true)
    public List<HostRoomResponse> getRoomsByHostId(Long hostId) {
        List<HostRoomResponse> rooms = new ArrayList<>();
        for (Room room : roomRepository.findByHostId(hostId)) {

            String imageUrl = room.getImages().isEmpty() ? "" : room.getImages().stream()
                    .filter(RoomImage::getIsRepresentative)
                    .findFirst()
                    .map(RoomImage::getImageUrl)
                    .orElse(room.getImages().get(0).getImageUrl());
            String status = room.getIsActive() ? "ACTIVE" : "INACTIVE";

            rooms.add(new HostRoomResponse(
                    room.getId(),
                    room.getName(),
                    room.getRegion(),
                    room.getAddress(),
                    room.getDescription(),
                    room.getPricePerNight(),
                    0, // 임시 더미 데이터 (rating)
                    0, // 임시 더미 데이터 (reviewCount)
                    room.getMaxCapacity(), // maxGuests 매핑
                    imageUrl,
                    room.getIsActive(), // isAvailable 매핑
                    room.getAllowsPets(),
                    room.getAllowsInfants(),
                    new ArrayList<>(room.getAmenities()),
                    "테스트 호스트", // 임시 더미 데이터 (hostName)
                    room.getLatitude(),
                    room.getLongitude(),
                    status
            ));
        }
        return rooms;
    }

}
