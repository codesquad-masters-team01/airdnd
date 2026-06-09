import { http, HttpResponse } from 'msw';
import { mockWishlists } from '../fixtures/mockData';
import { getMockUser } from './authHandlers';

export const wishlistHandlers = [
  http.get('/api/wishlist', () => {
    if (!getMockUser()) {
      return unauthorized();
    }

    return HttpResponse.json({
      wishlists: mockWishlists.map((wishlist) => ({
        id: wishlist.id,
        name: wishlist.name,
        roomCount: wishlist.rooms.length,
      })),
    });
  }),
  http.get('/api/wishlist/:wishlistId', ({ params }) => {
    if (!getMockUser()) {
      return unauthorized();
    }

    const wishlist = mockWishlists.find((item) => item.id === Number(params.wishlistId));

    if (!wishlist) {
      return HttpResponse.json(
        { code: 'WISHLIST_NOT_FOUND', message: '요청하신 위시리스트가 존재하지 않습니다.' },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      id: wishlist.id,
      name: wishlist.name,
      wishlistedRooms: wishlist.rooms,
    });
  }),
];

function unauthorized() {
  return HttpResponse.json(
    { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' },
    { status: 401 },
  );
}
