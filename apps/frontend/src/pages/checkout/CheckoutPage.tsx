import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { env } from '../../shared/config/env';
import { getStayNights } from '../../shared/lib/date';
import { formatCurrency, formatDate } from '../../shared/lib/format';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { Loading } from '../../shared/ui/Loading';
import { capturePaymentOrder, createPaymentOrder } from '../../features/payments/api/paymentsApi';
import {
  reservationQueryKeys,
  useReservationQuery,
} from '../../features/reservations/api/reservationsQueries';
import { roomQueryKeys } from '../../features/rooms/api/roomsQueries';
import { Reservation } from '../../features/reservations/model/reservationTypes';

export function CheckoutPage() {
  const { reservationId } = useParams();
  const id = Number(reservationId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // URL 파라미터 → 서버에서 예약을 다시 불러온다 (router state 대신). 새로고침·새 탭·재방문 OK.
  const { data: reservation, isLoading, isError, error } = useReservationQuery(id);
  const [payError, setPayError] = useState<unknown>(null);

  if (!Number.isFinite(id)) return <Navigate to="/" replace />;
  if (isLoading) return <Loading message="예약 정보를 불러오는 중입니다." />;
  if (isError || !reservation) {
    return (
      <div className="checkout-page">
        <div className="checkout-page__inner">
          <ErrorMessage error={error ?? new Error('예약을 찾을 수 없습니다.')} />
          <Link to="/reservations" className="booking-submit as-link">
            예약 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const expiresAt = reservation.expiresAt ? new Date(reservation.expiresAt) : null;
  const isExpired = expiresAt ? expiresAt.getTime() <= Date.now() : false;

  // 상태로 분기 — 이 페이지는 이제 어떤 상태로든 진입 가능하다.
  if (reservation.status === 'CONFIRMED') return <AlreadyPaid reservation={reservation} />;
  if (reservation.status === 'CANCELLED' || isExpired) return <Expired />;

  // status === 'PENDING' && 만료 전 → 결제 UI
  const nights = getStayNights(reservation.checkIn, reservation.checkOut);
  const paypalConfigured = env.paypalClientId.length > 0;

  return (
    <div className="checkout-page">
      <div className="checkout-page__inner">
        <button type="button" className="checkout-back" onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
        <h1 className="checkout-title">결제하기</h1>
        {expiresAt ? (
          <Countdown
            target={expiresAt}
            onExpire={() =>
              queryClient.invalidateQueries({ queryKey: reservationQueryKeys.detail(id) })
            }
          />
        ) : null}

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
                  // 주문 생성: reservationId 만 보낸다. 금액은 백엔드가 예약에서 재계산.
                  createOrder={async () => {
                    setPayError(null);
                    const { orderId } = await createPaymentOrder(id);
                    return orderId;
                  }}
                  // capture → 예약 PENDING→CONFIRMED. 성공 시 예약 상세로 이동.
                  onApprove={async (data) => {
                    try {
                      await capturePaymentOrder(data.orderID);
                      await queryClient.invalidateQueries({
                        queryKey: reservationQueryKeys.detail(id),
                      });
                      queryClient.invalidateQueries({ queryKey: reservationQueryKeys.list });
                      queryClient.invalidateQueries({
                        queryKey: roomQueryKeys.detail(reservation.roomId),
                      });
                      navigate(`/reservations/${id}`, { replace: true });
                    } catch (err) {
                      setPayError(err);
                    }
                  }}
                  onError={(err) =>
                    setPayError(err instanceof Error ? err : new Error(String(err)))
                  }
                />
              </PayPalScriptProvider>
            )}

            {payError ? (
              <div className="checkout-error">
                <ErrorMessage error={payError} />
              </div>
            ) : null}

            <p className="checkout-fineprint">
              결제는 PayPal 을 통해 {env.paypalCurrency} 로 처리됩니다. 표시 금액(원)은 참고용입니다.
            </p>
          </section>

          {/* 우측: 예약 요약 — 전부 reservation 에서 온다 (room 스냅샷·router state 불필요) */}
          <aside className="checkout-summary">
            <div className="checkout-summary__card">
              <div className="checkout-summary__room">
                {reservation.roomUrl ? (
                  <img
                    className="checkout-summary__thumb"
                    src={reservation.roomUrl}
                    alt={reservation.roomName}
                  />
                ) : null}
                <div>
                  <p className="checkout-summary__room-name">{reservation.roomName}</p>
                  <p className="checkout-summary__room-region">{reservation.region}</p>
                </div>
              </div>

              <hr className="checkout-summary__divider" />

              <SummaryRow
                label="일정"
                value={`${formatDate(reservation.checkIn)} → ${formatDate(reservation.checkOut)} · ${nights}박`}
              />
              <SummaryRow label="인원" value={`게스트 ${reservation.guests}명`} />

              <hr className="checkout-summary__divider" />

              <div className="checkout-summary__line">
                <span>
                  {formatCurrency(reservation.pricePerNight)} × {nights}박
                </span>
                <span>{formatCurrency(reservation.totalPrice)}</span>
              </div>
              <div className="checkout-summary__total">
                <span>총 합계</span>
                <span>{formatCurrency(reservation.totalPrice)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// 만료 카운트다운. 0 이 되면 onExpire 로 예약을 다시 불러와 상태 분기를 갱신.
function Countdown({ target, onExpire }: { target: Date; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(target.getTime() - Date.now());

  useEffect(() => {
    const tick = () => {
      const left = target.getTime() - Date.now();
      setRemaining(left);
      if (left <= 0) onExpire();
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target, onExpire]);

  if (remaining <= 0) return null;
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return (
    <p className="checkout-countdown">
      결제까지 {m}:{String(s).padStart(2, '0')} 남음
    </p>
  );
}

function AlreadyPaid({ reservation }: { reservation: Reservation }) {
  return (
    <div className="checkout-page">
      <div className="checkout-page__inner">
        <div className="booking-success">
          <div className="booking-success__check">
            <Check size={34} strokeWidth={3} color="#fff" />
          </div>
          <h2 className="booking-success__title">이미 결제가 완료된 예약입니다.</h2>
          <Link to={`/reservations/${reservation.id}`} className="booking-submit as-link">
            예약 상세 보기
          </Link>
        </div>
      </div>
    </div>
  );
}

function Expired() {
  return (
    <div className="checkout-page">
      <div className="checkout-page__inner">
        <div className="booking-success">
          <h2 className="booking-success__title">예약 대기 시간이 만료되었습니다.</h2>
          <p className="booking-success__desc">날짜를 다시 선택해 예약을 진행해 주세요.</p>
          <Link to="/" className="booking-submit as-link">
            숙소 둘러보기
          </Link>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="booking-summary-row">
      <span className="booking-summary-row__label">{label}</span>
      <span className="booking-summary-row__value">{value}</span>
    </div>
  );
}
