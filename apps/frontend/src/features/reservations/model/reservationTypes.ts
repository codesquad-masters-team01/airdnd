import { z } from 'zod';

export const reservationStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']);

export const reservationSchema = z.object({
  id: z.number(),
  roomId: z.number(),
  roomName: z.string(),
  roomUrl: z.string(),
  region: z.string().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number(),
  pricePerNight: z.number(),
  totalPrice: z.number(),
  status: reservationStatusSchema,
  expiresAt: z.string().nullish(), // PENDING 홀드 만료 시각(ISO). CONFIRMED/CANCELLED 면 null
  guestName: z.string().optional(),
  createdAt: z.string().optional(),
});

export const bookedDateRangeSchema = z.object({
  checkInDate: z.string(),
  checkOutDate: z.string(),
});

export type BookedDateRange = z.infer<typeof bookedDateRangeSchema>;

export const createReservationSchema = z
  .object({
    roomId: z.number(),
    checkIn: z.string().min(1, '체크인 날짜를 선택하세요.'),
    checkOut: z.string().min(1, '체크아웃 날짜를 선택하세요.'),
    adults: z.coerce.number().min(1, '성인은 1명 이상이어야 합니다.'),
    children: z.coerce.number().min(0).default(0),
    infants: z.coerce.number().min(0).default(0),
    pets: z.coerce.number().min(0).default(0),
  })
  .refine((value) => value.checkIn < value.checkOut, {
    message: '체크아웃은 체크인보다 늦어야 합니다.',
    path: ['checkOut'],
  });

/**
 * POST /api/reservations 로 보내는 PENDING 홀드 생성 페이로드.
 * 금액(totalPrice)·guestId 는 보내지 않는다 — 백엔드가 roomId+날짜로 재계산하고
 * guestId 는 인증 principal 에서 가져온다.
 */
export type CreateReservationPayload = {
  roomId: number;
  checkInDate: string; // yyyy-MM-dd
  checkOutDate: string; // yyyy-MM-dd
  adultCount: number;
  childCount: number;
  infantCount: number;
  hasPets: boolean;
};

export type Reservation = z.infer<typeof reservationSchema>;
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type CreateReservationFormValues = z.input<typeof createReservationSchema>;
