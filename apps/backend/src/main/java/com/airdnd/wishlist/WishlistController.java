package com.airdnd.wishlist;

import com.airdnd.auth.AuthMemberPrincipal;
import com.airdnd.wishlist.dto.WishlistListResponse;
import com.airdnd.wishlist.dto.WishlistResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService service;

    @GetMapping
    public ResponseEntity<WishlistListResponse> getAllWishLists(@AuthenticationPrincipal AuthMemberPrincipal principal) {
        List<Wishlist> allWishlists = service.getAllWishListsByMemberId(principal.getMemberId());
        return ResponseEntity.ok(WishlistListResponse.of(allWishlists));
    }

    @GetMapping("/{wishlistId}")
    public ResponseEntity<WishlistResponse> getWishlistByWishlistId(
            @AuthenticationPrincipal AuthMemberPrincipal principal,
            @PathVariable Long wishlistId) {
        Wishlist wishlist = service.getWishListByWishListId(principal.getMemberId(), wishlistId);
        return ResponseEntity.ok(WishlistResponse.from(wishlist));
    }
}
