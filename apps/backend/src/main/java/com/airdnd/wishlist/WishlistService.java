package com.airdnd.wishlist;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.exception.BusinessException;
import com.airdnd.user.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    @Transactional
    public Member createDefaultWishlist(Member member) {
        wishlistRepository.save(Wishlist.createDefault(member.getId()));
        return member;
    }

    @Transactional(readOnly = true)
    public List<Wishlist> getAllWishListsByMemberId(Long memberId) {
        return wishlistRepository.findAllWithRoomsByMemberId(memberId);
    }

    @Transactional(readOnly = true)
    public Wishlist getWishListByWishListId(Long memberId, Long wishlistId) {
        return wishlistRepository.findDetailByIdAndMemberId(wishlistId, memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WISHLIST_NOT_FOUND));
    }
}
