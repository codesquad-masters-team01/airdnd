package com.airdnd.wishlist.dto;

import com.airdnd.wishlist.Wishlist;

import java.util.List;

public record WishlistListResponse(
        List<WishlistSummary> wishlists
) {
    public static WishlistListResponse of(List<Wishlist> wishlists) {
        List<WishlistSummary> summaries = wishlists.stream()
                .map(WishlistSummary::from)
                .toList();
        return new WishlistListResponse(summaries);
    }

    public record WishlistSummary(
            Long id,
            String name,
            int roomCount
    ) {
        public static WishlistSummary from(Wishlist wishlist) {
            // findAllWithRoomsByMemberId가 rooms를 fetch join으로 로딩했으므로 size() 접근이 안전합니다.
            return new WishlistSummary(wishlist.getId(), wishlist.getName(), wishlist.getRooms().size());
        }
    }
}
