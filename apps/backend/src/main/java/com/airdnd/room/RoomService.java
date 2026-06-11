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
        List<RoomResponse> rooms = new ArrayList<>();
        for (Room room : roomRepository.findAllByIsActive()) {
            String imageUrl = room.getRepresentativeImageUrl();

            rooms.add(new RoomResponse(
                    room.getId(),
                    room.getName(),
                    room.getRegion(),
                    room.getAddress(),
                    room.getPricePerNight(),
                    room.getMaxCapacity(),
                    imageUrl,
                    room.getLatitude(),
                    room.getLongitude(),
                    room.getIsActive(),
                    room.getAllowsPets()
            ));
        }
        return rooms;
    }

    @Transactional(readOnly = true)
    public RoomDetailResponse getRoomById(Long id) {

        Room room = roomRepository.findById(id).orElseThrow(()
                -> new IllegalStateException("Room with id " + id + " not found!"));

        if (!room.getIsActive()) {
            throw new IllegalStateException("Room with id " + id + " is not active!");
        }
        if (room.getIsDeleted()) {
            throw new IllegalStateException("Room with id " + id + " is deleted!");
        }

        return RoomDetailResponse.from(room);
    }


    @Transactional
    public RoomDetailResponse updateRoomDetails(Long hostId,Long roomId, RoomUpdateRequest request) {
        Room room = roomRepository.findById(roomId).orElseThrow(()
                -> new IllegalStateException("Room with id " + roomId + " not found!"));

        if (!room.getHostId().equals(hostId)) {
            throw new IllegalStateException("Room with id " + hostId + " does not belong to this host!");
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
