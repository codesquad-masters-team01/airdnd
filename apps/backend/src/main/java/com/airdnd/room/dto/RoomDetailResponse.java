package com.airdnd.room.dto;

import com.airdnd.room.Room;
import com.airdnd.room.RoomImage;

import java.math.BigDecimal;
import java.util.List;

public record RoomDetailResponse(
        Long id,
        String name,
        String region,
        String address,
        String description,
        Integer pricePerNight,
        Integer rating,
        Integer reviewCount,
        Integer maxGuests,
        String imageUrl,
        List<String> imageUrls,
        Boolean isAvailable,
        Boolean allowsPets,
        Boolean allowsInfants,
        List<String> amenities,
        String hostName,
        BigDecimal latitude,
        BigDecimal longitude
) {
    // 이미지가 전혀 없을 때 프론트엔드의 URL 스키마 검증(.url())을 통과시키기 위한 대체 이미지
    private static final String PLACEHOLDER_IMAGE_URL = "https://placehold.co/600x400?text=No+Image";

    public static RoomDetailResponse from(Room room) {
        List<RoomImage> images = room.getImages();

        String representativeImageUrl = images.stream()
                .filter(RoomImage::getIsRepresentative)
                .findFirst()
                .map(RoomImage::getImageUrl)
                .orElseGet(() -> images.isEmpty() ? PLACEHOLDER_IMAGE_URL : images.get(0).getImageUrl());

        List<String> additionalImageUrls = images.stream()
                .filter(image -> !image.getIsRepresentative())
                .map(RoomImage::getImageUrl)
                .toList();

        String description = room.getDescription() == null ? "" : room.getDescription();

        return new RoomDetailResponse(
                room.getId(),
                room.getName(),
                room.getRegion(),
                room.getAddress(),
                description,
                room.getPricePerNight(),
                0, // 임시 더미 데이터 (rating)
                0, // 임시 더미 데이터 (reviewCount)
                room.getMaxCapacity(),
                representativeImageUrl,
                additionalImageUrls,
                room.getIsActive(),
                room.getAllowsPets(),
                room.getAllowsInfants(),
                List.copyOf(room.getAmenities()),
                "테스트 호스트", // 임시 더미 데이터 (hostName)
                room.getLatitude(),
                room.getLongitude()
        );
    }
}
