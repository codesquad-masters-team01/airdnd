import { http, HttpResponse } from 'msw';
import { mockRooms, toRoomDetail } from '../fixtures/mockData';

export const roomHandlers = [
  http.get('/api/rooms', ({ request }) => {
    const url = new URL(request.url);
    const region = url.searchParams.get('region')?.trim();
    const guests = Number(url.searchParams.get('guests') ?? '0');

    const rooms = mockRooms
      .filter((room) => room.status === 'ACTIVE')
      .filter((room) => (region ? room.region.includes(region) || room.address.includes(region) : true))
      .filter((room) => (guests > 0 ? room.maxGuests >= guests : true));

    return HttpResponse.json(rooms);
  }),
  http.get('/api/rooms/:roomId', ({ params }) => {
    const roomId = Number(params.roomId);
    const room = mockRooms.find((item) => item.id === roomId && item.status === 'ACTIVE');

    if (!room) {
      return HttpResponse.json(
        { code: 'ROOM_NOT_FOUND', message: '숙소를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return HttpResponse.json(toRoomDetail(room));
  }),
];
