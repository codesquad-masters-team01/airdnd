package com.airdnd.room;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.room.dto.*;
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
    public Long registerRoom(Long memberId, String hostName ,HostRoomRequest request) {

        Room room = Room.fromRoomRequest(memberId,hostName ,request);

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

    @Transactional(readOnly = true)
    public List<RoomResponse> getRooms(RoomSearchRequestDTO conditions) {
        List<Room> rooms = roomRepository.findByRoomSearchRequest(conditions);
        return RoomResponse.fromList(rooms);
    }

    @Transactional(readOnly = true)
    public RoomDetailResponse getRoomById(Long id) {

        Room room = roomRepository.findById(id).orElseThrow(()
                -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        if (!room.getIsActive() || room.getIsDeleted()) {
            throw new BusinessException(ErrorCode.ROOM_NOT_FOUND);
        }
        return RoomDetailResponse.from(room);
    }


    @Transactional
    public RoomDetailResponse updateRoomDetails(Long hostId,Long roomId, RoomUpdateRequest request) {
        Room room = roomRepository.findById(roomId).orElseThrow(()
                -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        if (!room.getHostId().equals(hostId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }
        room.updateRoom(
                request.name(),
                request.description(),
                request.pricePerNight(),
                request.maxGuests(),
                request.allowsInfants(),
                request.allowsPets(),
                request.amenities()
        );

        if (request.imageUrls() != null && !request.imageUrls().isEmpty()) {
            List<RoomImage> newImages = new ArrayList<>();
            for (int i = 0; i < request.imageUrls().size(); i++) {
                RoomImage image = RoomImage.builder()
                        .imageUrl(request.imageUrls().get(i))
                        .isRepresentative(i == 0)
                        .build();
                newImages.add(image);
            }
            room.updateImages(newImages);
        }

        return RoomDetailResponse.from(room);
    }

    @Transactional
    public HostRoomResponse getRoomForUpdateById(Long memberId, Long roomId){
        Room room = roomRepository.findById(roomId).orElseThrow(()-> new BusinessException(ErrorCode.ROOM_NOT_FOUND));
        if(!room.getHostId().equals(memberId)){
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACTION);
        }
        return HostRoomResponse.from(room);
    }
}
