import { useQuery } from '@tanstack/react-query';
import { getWishlist, getWishlists } from './wishlistApi';

export const wishlistQueryKeys = {
  list: ['wishlist', 'list'] as const,
  detail: (wishlistId: number) => ['wishlist', 'detail', wishlistId] as const,
};

export function useWishlistsQuery() {
  return useQuery({
    queryKey: wishlistQueryKeys.list,
    queryFn: getWishlists,
  });
}

export function useWishlistQuery(wishlistId?: number) {
  return useQuery({
    queryKey: wishlistQueryKeys.detail(wishlistId ?? 0),
    queryFn: () => getWishlist(wishlistId as number),
    enabled: typeof wishlistId === 'number' && Number.isFinite(wishlistId),
  });
}
