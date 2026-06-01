import { AdminDashboard } from '../../features/admin/model/adminTypes';
import { User } from '../../features/auth/model/authTypes';
import { HostRoom } from '../../features/host/model/hostRoomTypes';
import { Reservation } from '../../features/reservations/model/reservationTypes';
import { RoomDetail } from '../../features/rooms/model/roomTypes';

export const mockUsers: Record<User['role'], User> = {
  GUEST: {
    id: 1,
    name: '게스트 사용자',
    email: 'guest@airdnd.test',
    role: 'GUEST',
  },
  HOST: {
    id: 2,
    name: '호스트 사용자',
    email: 'host@airdnd.test',
    role: 'HOST',
  },
  ADMIN: {
    id: 3,
    name: '관리자 사용자',
    email: 'admin@airdnd.test',
    role: 'ADMIN',
  },
};

export const mockRooms: HostRoom[] = [
  {
    id: 101,
    name: '성수 루프탑 스테이',
    region: '서울',
    address: '서울특별시 성동구 성수동',
    pricePerNight: 145000,
    rating: 4.8,
    reviewCount: 128,
    maxGuests: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    isAvailable: true,
    description:
      '성수동 카페 거리와 가까운 루프탑 숙소입니다. 업무와 휴식을 함께 하기 좋은 넓은 거실과 야외 테라스를 제공합니다.',
    amenities: ['와이파이', '주방', '세탁기', '루프탑', '업무 공간'],
    hostName: '호스트 사용자',
    latitude: 37.5446,
    longitude: 127.0557,
    status: 'ACTIVE',
  },
  {
    id: 102,
    name: '부산 오션뷰 하우스',
    region: '부산',
    address: '부산광역시 해운대구 우동',
    pricePerNight: 220000,
    rating: 4.9,
    reviewCount: 86,
    maxGuests: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
    isAvailable: true,
    description:
      '해운대 바다가 보이는 고층 숙소입니다. 가족 여행과 장기 숙박에 적합한 넉넉한 공간을 제공합니다.',
    amenities: ['오션뷰', '주차', '엘리베이터', '주방', '욕조'],
    hostName: '호스트 사용자',
    latitude: 35.1631,
    longitude: 129.1635,
    status: 'ACTIVE',
  },
  {
    id: 103,
    name: '제주 귤밭 독채',
    region: '제주',
    address: '제주특별자치도 서귀포시 남원읍',
    pricePerNight: 180000,
    rating: 4.7,
    reviewCount: 54,
    maxGuests: 5,
    imageUrl:
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
    isAvailable: true,
    description:
      '귤밭 사이에 있는 조용한 독채 숙소입니다. 마당과 바비큐 공간을 사용할 수 있습니다.',
    amenities: ['독채', '마당', '바비큐', '주차', '반려동물 가능'],
    hostName: '호스트 사용자',
    latitude: 33.2799,
    longitude: 126.7203,
    status: 'PENDING_APPROVAL',
  },
];

export const mockReservations: Reservation[] = [
  {
    id: 9001,
    roomId: 101,
    roomName: '성수 루프탑 스테이',
    roomImageUrl: mockRooms[0].imageUrl,
    checkIn: '2026-07-10',
    checkOut: '2026-07-12',
    guests: 2,
    totalPrice: 290000,
    status: 'CONFIRMED',
  },
];

export const mockAdminDashboard: AdminDashboard = {
  pendingRooms: 4,
  activeUsers: 128,
  reservationsToday: 12,
  waitQueueSize: 0,
};

export function toRoomDetail(room: HostRoom): RoomDetail {
  return room;
}
