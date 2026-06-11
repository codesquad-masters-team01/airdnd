package com.airdnd.room;

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

    @Transactional(readOnly = true)
    public List<RoomResponse> getRooms() {
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

        List<String> imageUrls = room.getImages().stream()
                .map(RoomImage::getImageUrl)
                .toList();

        return new RoomDetailResponse(
                room.getId(),
                room.getName(),
                room.getRegion(),
                room.getAddress(),
                room.getPricePerNight(),
                room.getMaxCapacity(),
                room.getRepresentativeImageUrl(),
                room.getIsActive(),
                room.getAllowsPets(),
                room.getAllowsInfants(),
                room.getDescription(),
                new ArrayList<>(room.getAmenities()),
                imageUrls,
                "이완자",
                room.getLatitude(),
                room.getLongitude()
        );
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

        // 이미지 갱신: imageUrls의 첫 번째가 대표 사진, 나머지는 추가 사진
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

        List<String> imageUrls = room.getImages().stream()
                .map(RoomImage::getImageUrl)
                .toList();

        return new RoomDetailResponse(
                room.getId(),
                room.getName(),
                room.getRegion(),
                room.getAddress(),
                room.getPricePerNight(),
                room.getMaxCapacity(),
                room.getRepresentativeImageUrl(),
                room.getIsActive(),
                room.getAllowsPets(),
                room.getAllowsInfants(),
                room.getDescription(),
                new ArrayList<>(room.getAmenities()),
                imageUrls,
                "이완자",
                room.getLatitude(),
                room.getLongitude()
        );
    }

}
