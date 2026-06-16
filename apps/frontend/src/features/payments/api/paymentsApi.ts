import { request } from '../../../shared/api/httpClient';
import {
  CheckoutDraft,
  captureOrderResponseSchema,
  createOrderResponseSchema,
} from '../model/paymentTypes';

/**
 * PayPal 주문 생성. 백엔드가 방·날짜로 금액을 재계산해 PayPal Orders v2 주문을 만들고
 * 그 order id 를 돌려준다. (draft 는 백엔드에서 orderId 에 매핑해 임시 저장)
 */
export async function createPaymentOrder(draft: CheckoutDraft) {
  const data = await request<unknown>('/api/payments/orders', {
    method: 'POST',
    body: draft,
  });
  return createOrderResponseSchema.parse(data);
}

/**
 * 결제 확정(capture). 백엔드가 PayPal capture 를 호출하고, 성공 시 예약을 생성한 뒤
 * 생성된 reservationId 를 돌려준다.
 */
export async function capturePaymentOrder(orderId: string) {
  const data = await request<unknown>(`/api/payments/orders/${orderId}/capture`, {
    method: 'POST',
  });
  return captureOrderResponseSchema.parse(data);
}
