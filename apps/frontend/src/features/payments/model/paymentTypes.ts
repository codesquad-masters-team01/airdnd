import { z } from 'zod';

/**
 * 결제 페이지로 넘어갈 때 router state 로 전달되는 예약 초안.
 * 금액·guestId 는 보안을 위해 프론트가 보내지 않고 백엔드가 서버에서 결정한다.
 * (백엔드는 roomId + 날짜로 금액을 재계산하고, guestId 는 인증 principal 에서 가져온다.)
 */
export type CheckoutDraft = {
  roomId: number;
  checkInDate: string; // yyyy-MM-dd
  checkOutDate: string; // yyyy-MM-dd
  adultCount: number;
  childCount: number;
  infantCount: number;
  hasPets: boolean;
};

/** 결제 화면 표시에 필요한 숙소 스냅샷 (추가 API 호출을 피하기 위해 함께 전달) */
export type CheckoutRoom = {
  id: number;
  name: string;
  pricePerNight: number;
  imageUrl: string;
  region: string;
};

/** /checkout 라우트가 location.state 로 받는 값 */
export type CheckoutState = {
  draft: CheckoutDraft;
  room: CheckoutRoom;
};

// 주문 생성 응답: PayPal order id
export const createOrderResponseSchema = z.object({
  orderId: z.string(),
});

// 결제 확정(capture) 응답: 생성된 예약 id
export const captureOrderResponseSchema = z.object({
  reservationId: z.number(),
});

export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>;
export type CaptureOrderResponse = z.infer<typeof captureOrderResponseSchema>;
