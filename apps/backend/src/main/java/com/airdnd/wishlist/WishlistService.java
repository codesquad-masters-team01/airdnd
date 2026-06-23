package com.airdnd.wishlist;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.room.Room;
import com.airdnd.room.RoomRepository;
import com.airdnd.room.dto.RoomRatingDto;
import com.airdnd.user.Member;
import com.airdnd.wishlist.dto.RoomWishlistIdsResponse;
import com.airdnd.wishlist.dto.SavedRoomIdsResponse;
import com.airdnd.wishlist.dto.WishlistListResponse;
import com.airdnd.wishlist.dto.WishlistRequest;
import com.airdnd.wishlist.dto.WishlistResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final RoomRepository roomRepository;
    private final WishlistRoomRepository wishlistRoomRepository;

    @Transactional
    public Member createDefaultWishlist(Member member) {
        wishlistRepository.save(Wishlist.createDefault(member.getId()));
        return member;
    }

    @Transactional(readOnly = true)
    public WishlistListResponse getAllWishListsByMemberId(Long memberId) {
        return WishlistListResponse.of(wishlistRepository.findAllWithRoomsByMemberId(memberId));
    }

    @Transactional(readOnly = true)
    public WishlistResponse getWishListByWishListId(Long memberId, Long wishlistId) {
        // DTO 매핑(지연 로딩되는 room.images/amenities 접근)을 트랜잭션 경계 안에서 수행해야
        // open-in-view=false 환경에서 LazyInitializationException이 발생하지 않습니다.
        Wishlist wishlist = wishlistRepository.findDetailByIdAndMemberId(wishlistId, memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WISHLIST_NOT_FOUND));

        List<Long> roomIds = wishlist.getRooms().stream()
                .map(wishlistRoom -> wishlistRoom.getRoom().getId()).toList();

        Map <Long, RoomRatingDto> ratings = roomRepository.findRatingByRoomIds(roomIds);
        return WishlistResponse.from(wishlist, ratings);
    }

    @Transactional
    public void createNewWishlist(Long memberId, WishlistRequest request){
        if(wishlistRepository.existsWishlistByMemberIdAndNameIgnoreCase(memberId, request.name())){
            throw new BusinessException(ErrorCode.WISHLIST_ALREADY_EXISTS);
        }
        wishlistRepository.save(Wishlist.create(memberId,request.name()));
    }

    @Transactional
    public void addRoomToWishlist(Long memberId, Long wishlistId ,Long roomId){
        Wishlist targetWishlist = wishlistRepository.findById(wishlistId).orElseThrow(() -> new BusinessException(ErrorCode.WISHLIST_NOT_FOUND));
        if(!targetWishlist.getMemberId().equals(memberId)){
            throw new BusinessException(ErrorCode.WISHLIST_BELONG_TO_OTHERS);
        }
        Room targetRoom = roomRepository.findById(roomId).orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));
        if(targetWishlist.getRooms().stream().anyMatch(wlr -> wlr.getRoom().getId().equals(roomId))){
            throw new BusinessException(ErrorCode.WISHLIST_ROOM_ALREADY_EXISTS);
        }
        targetWishlist.addRoom(targetRoom);
        wishlistRepository.save(targetWishlist);
    }

    @Transactional(readOnly = true)
    public SavedRoomIdsResponse getSavedRoomIds(Long memberId) {
        return new SavedRoomIdsResponse(wishlistRoomRepository.findRoomIdsByMemberId(memberId));
    }

    @Transactional
    public void removeRoomFromWishlists(Long memberId, Long roomId) {
        wishlistRoomRepository.deleteByRoomIdAndMemberId(roomId, memberId);
    }

    @Transactional(readOnly = true)
    public RoomWishlistIdsResponse getWishlistIdsForRoom(Long memberId, Long roomId) {
        return new RoomWishlistIdsResponse(wishlistRoomRepository.findWishlistIdsByRoomIdAndMemberId(roomId, memberId));
    }

    @Transactional
    public void removeRoomFromFolder(Long memberId, Long wishlistId, Long roomId) {
        Wishlist targetWishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WISHLIST_NOT_FOUND));
        if (!targetWishlist.getMemberId().equals(memberId)) {
            throw new BusinessException(ErrorCode.WISHLIST_BELONG_TO_OTHERS);
        }
        // 멱등: 해당 폴더에 그 방이 없으면 0건 삭제.
        wishlistRoomRepository.deleteByWishlistIdAndRoomId(wishlistId, roomId);
    }
}
