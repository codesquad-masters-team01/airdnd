import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { env } from '../../shared/config/env';
import { getStayNights } from '../../shared/lib/date';
import { formatCurrency, formatDate } from '../../shared/lib/format';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { Modal } from '../../shared/ui/Modal';
import { CheckoutState } from '../../features/payments/model/paymentTypes';
import { capturePaymentOrder, createPaymentOrder } from '../../features/payments/api/paymentsApi';
import { reservationQueryKeys } from '../../features/reservations/api/reservationsQueries';
import { roomQueryKeys } from '../../features/rooms/api/roomsQueries';

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const state = location.state as CheckoutState | null;

  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // 직접 URL 진입·새로고침 등으로 예약 정보가 없으면 홈으로 돌려보낸다.
  if (!state?.draft || !state?.room) {
    return <Navigate to="/" replace />;
  }

  const { draft, room } = state;
  const nights = getStayNights(draft.checkInDate, draft.checkOutDate);
  const totalPrice = nights * room.pricePerNight;
  const guests = draft.adultCount + draft.childCount;
  const guestSummary = buildGuestSummary(draft);
  const scheduleText = `${formatDate(draft.checkInDate)} → ${formatDate(draft.checkOutDate)} · ${nights}박`;

  const paypalConfigured = env.paypalClientId.length > 0;

  return (
    <div className="checkout-page">
      <div className="checkout-page__inner">
        <button type="button" className="checkout-back" onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
        <h1 className="checkout-title">결제하기</h1>

        <div className="checkout-layout">
          {/* 좌측: 결제 수단 */}
          <section className="checkout-pay">
            <h2 className="checkout-section-title">결제 수단</h2>

            {!paypalConfigured ? (
              <div className="checkout-config-warning">
                <p>PayPal 클라이언트 ID 가 설정되지 않았습니다.</p>
                <p className="checkout-config-warning__hint">
                  <code>VITE_PAYPAL_CLIENT_ID</code> 를 <code>.env</code> 에 설정한 뒤 다시 시도하세요.
                </p>
              </div>
            ) : (
              <PayPalScriptProvider
                options={{
                  clientId: env.paypalClientId,
                  currency: env.paypalCurrency,
                  intent: 'capture',
                }}
              >
                <PayPalButtons
                  style={{ layout: 'vertical', label: 'pay' }}
                  // 주문 생성: 백엔드가 금액을 계산해 PayPal order 를 만들고 id 를 돌려준다.
                  createOrder={async () => {
                    setError(null);
                    const { orderId } = await createPaymentOrder(draft);
                    return orderId;
                  }}
                  // 결제 확정: 백엔드 capture → 예약 생성. 성공 시 완료 모달.
                  onApprove={async (data) => {
                    try {
                      await capturePaymentOrder(data.orderID);
                      queryClient.invalidateQueries({ queryKey: reservationQueryKeys.list });
                      queryClient.invalidateQueries({ queryKey: roomQueryKeys.detail(room.id) });
                      setShowSuccess(true);
                    } catch (err) {
                      setError(err);
                    }
                  }}
                  onError={(err) => {
                    setError(err instanceof Error ? err : new Error(String(err)));
                  }}
                />
              </PayPalScriptProvider>
            )}

            {error ? (
              <div className="checkout-error">
                <ErrorMessage error={error} />
              </div>
            ) : null}

            <p className="checkout-fineprint">
              결제는 PayPal 을 통해 {env.paypalCurrency} 로 처리됩니다. 표시 금액(원)은 참고용입니다.
            </p>
          </section>

          {/* 우측: 예약 요약 */}
          <aside className="checkout-summary">
            <div className="checkout-summary__card">
              <div className="checkout-summary__room">
                {room.imageUrl ? (
                  <img className="checkout-summary__thumb" src={room.imageUrl} alt={room.name} />
                ) : null}
                <div>
                  <p className="checkout-summary__room-name">{room.name}</p>
                  <p className="checkout-summary__room-region">{room.region}</p>
                </div>
              </div>

              <hr className="checkout-summary__divider" />

              <SummaryRow label="일정" value={scheduleText} />
              <SummaryRow label="인원" value={guestSummary} />

              <hr className="checkout-summary__divider" />

              <div className="checkout-summary__line">
                <span>
                  {formatCurrency(room.pricePerNight)} × {nights}박
                </span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="checkout-summary__total">
                <span>총 합계</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 결제 완료 팝업 */}
      <Modal open={showSuccess} onClose={() => navigate('/reservations')} ariaLabel="결제 완료">
        <div className="booking-success">
          <div className="booking-success__check">
            <Check size={34} strokeWidth={3} color="#fff" />
          </div>
          <h2 className="booking-success__title">결제가 완료되었습니다!</h2>
          <p className="booking-success__desc">예약 내역은 ‘예약 목록’에서 확인할 수 있어요.</p>

          <div className="booking-success__summary">
            <SummaryRow label="숙소" value={room.name} />
            <SummaryRow label="일정" value={scheduleText} />
            <SummaryRow label="인원" value={`게스트 ${guests}명`} />
            <SummaryRow label="총 금액" value={formatCurrency(totalPrice)} emphasize />
          </div>

          <Link to="/reservations" className="booking-submit as-link">
            예약 목록 보기
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/rooms/${room.id}`)}
            className="booking-success__dismiss"
          >
            계속 둘러보기
          </button>
        </div>
      </Modal>
    </div>
  );
}

function SummaryRow({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="booking-summary-row">
      <span className="booking-summary-row__label">{label}</span>
      <span className={`booking-summary-row__value${emphasize ? ' emphasize' : ''}`}>{value}</span>
    </div>
  );
}

function buildGuestSummary({
  adultCount,
  childCount,
  infantCount,
  hasPets,
}: {
  adultCount: number;
  childCount: number;
  infantCount: number;
  hasPets: boolean;
}) {
  let summary = `게스트 ${adultCount + childCount}명`;
  if (infantCount > 0) summary += `, 유아 ${infantCount}명`;
  if (hasPets) summary += `, 반려동물 동반`;
  return summary;
}
