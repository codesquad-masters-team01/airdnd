package com.airdnd.room;

import com.airdnd.room.dto.HostRoomRequest;
import com.airdnd.room.dto.HostRoomResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;


    @Transactional
    public Long registerRoom(Long memberId ,HostRoomRequest request) {

        Room room = Room.fromRoomRequest(memberId,request);

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
        return roomRepository.findByHostId(hostId).stream()
                .map(HostRoomResponse::from)
                .toList();
    }

}
