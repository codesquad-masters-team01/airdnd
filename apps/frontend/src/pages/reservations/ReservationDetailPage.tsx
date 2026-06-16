import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Clock, MapPin, UsersRound, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  reservationQueryKeys,
  useCancelReservationMutation,
  useReservationQuery,
} from '../../features/reservations/api/reservationsQueries';
import {
  reservationStatusText,
  reservationStatusTone,
} from '../../features/reservations/model/reservationStatus';
import { getStayNights } from '../../shared/lib/date';
import { formatCurrency, formatDate } from '../../shared/lib/format';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { Loading } from '../../shared/ui/Loading';
import { Modal } from '../../shared/ui/Modal';
import { StatusBadge } from '../../shared/ui/StatusBadge';

export function ReservationDetailPage() {
  const { reservationId } = useParams();
  const id = Number(reservationId);
  const queryClient = useQueryClient();

  const reservationQuery = useReservationQuery(id);
  const cancelMutation = useCancelReservationMutation();
  const [confirmCancel, setConfirmCancel] = useState(false);
  // 카운트다운이 0에 도달하면 서버를 다시 부르지 않고 로컬에서만 만료 화면으로 전환한다.
  const [holdExpired, setHoldExpired] = useState(false);
  useEffect(() => {
    setHoldExpired(false); // 다른 예약으로 이동하면 초기화
  }, [id]);
  const handleHoldExpired = useCallback(() => setHoldExpired(true), []);

  if (reservationQuery.isLoading) {
    return <Loading message="예약 정보를 불러오는 중입니다." />;
  }
  if (reservationQuery.error) {
    return <ErrorMessage error={reservationQuery.error} />;
  }
  const reservation = reservationQuery.data;
  if (!reservation) {
    return null;
  }

  const nights = getStayNights(reservation.checkIn, reservation.checkOut);
  const expiresAt = reservation.expiresAt ? new Date(reservation.expiresAt) : null;
  const isExpired = holdExpired || (expiresAt ? expiresAt.getTime() <= Date.now() : false);
  const isCancelled = reservation.status === 'CANCELLED';
  const isConfirmed = reservation.status === 'CONFIRMED';
  const isPendingActive = reservation.status === 'PENDING' && !isExpired;
  const isPendingExpired = reservation.status === 'PENDING' && isExpired;

  const refetchDetail = () =>
    queryClient.invalidateQueries({ queryKey: reservationQueryKeys.detail(id) });

  const handleCancel = () => {
    setConfirmCancel(false);
    cancelMutation.mutate(reservation.id, { onSuccess: refetchDetail });
  };

  // 취소 가능: 확정됐거나 결제 대기 중인 예약 (이미 취소/만료된 건은 불가)
  const cancellable = isConfirmed || isPendingActive;

  return (
    <section className="detail-layout">
      <article className={`stack detail-content${isCancelled ? ' reservation-detail--cancelled' : ''}`}>
        <img
          className="detail-hero reservation-detail-hero"
          src={reservation.roomUrl}
          alt={`${reservation.roomName} 대표 이미지`}
        />

        <div className="detail-header">
          <div className="detail-header-top">
            <div className="page-heading">
              <p className="eyebrow">Reservation</p>
              <h1>예약 상세</h1>
              <p className="muted">예약 번호 #{reservation.id}</p>
            </div>
            <StatusBadge tone={reservationStatusTone[reservation.status]}>
              {reservationStatusText[reservation.status]}
            </StatusBadge>
          </div>
        </div>

        <div className="content-section">
          <h2>{reservation.roomName}</h2>
          <div className="info-row">
            <span>
              <MapPin size={16} /> {reservation.region ?? '지역 정보 없음'}
            </span>
            <span>
              <CalendarDays size={16} /> {formatDate(reservation.checkIn)} -{' '}
              {formatDate(reservation.checkOut)}
            </span>
            <span>
              <UsersRound size={16} /> 게스트 {reservation.guests}명 · {nights}박
            </span>
          </div>
        </div>

        <div className="content-section">
          <h2>결제 요약</h2>
          <div className="price-summary">
            <span>
              {formatCurrency(reservation.pricePerNight)} × {nights}박
            </span>
            <strong>{formatCurrency(reservation.totalPrice)}</strong>
          </div>
          <div className="price-summary price-summary--total">
            <span>총 합계</span>
            <strong>{formatCurrency(reservation.totalPrice)}</strong>
          </div>
        </div>
      </article>

      <aside className="reservation-panel reservation-status-panel">
        {isPendingActive ? (
          <>
            <p className="reservation-panel__title">
              <Clock size={18} /> 결제 대기 중
            </p>
            {expiresAt ? (
              <Countdown targetMs={expiresAt.getTime()} onExpire={handleHoldExpired} />
            ) : null}
            <p className="muted">제한 시간 안에 결제를 완료해야 예약이 확정됩니다.</p>
            <Link className="primary-button full-width" to={`/checkout/${reservation.id}`}>
              결제 계속하기
            </Link>
          </>
        ) : null}

        {isPendingExpired ? (
          <>
            <p className="reservation-panel__title">
              <XCircle size={18} /> 결제 시간 만료
            </p>
            <p className="muted">결제 제한 시간이 지나 선점이 해제되었습니다. 다시 예약해 주세요.</p>
            <Link className="primary-button full-width" to={`/rooms/${reservation.roomId}`}>
              다시 예약하기
            </Link>
          </>
        ) : null}

        {isConfirmed ? (
          <>
            <p className="reservation-panel__title reservation-panel__title--success">
              <CheckCircle2 size={18} /> 예약이 확정되었어요
            </p>
            <p className="muted">체크인 전 예약 정보와 알림을 확인하세요.</p>
          </>
        ) : null}

        {isCancelled ? (
          <>
            <p className="reservation-panel__title">
              <XCircle size={18} /> 취소된 예약
            </p>
            <p className="muted">환불 금액은 숙소의 취소 정책에 따라 결정됩니다.</p>
            <Link className="primary-button full-width" to="/">
              숙소 둘러보기
            </Link>
          </>
        ) : null}

        <Link className="secondary-button full-width" to="/reservations">
          예약 목록으로
        </Link>

        {cancellable ? (
          <button
            type="button"
            className="reservation-panel__cancel"
            disabled={cancelMutation.isPending}
            onClick={() => setConfirmCancel(true)}
          >
            {cancelMutation.isPending ? (
              <>
                <span className="button-spinner" aria-hidden="true" /> 취소 중…
              </>
            ) : (
              '예약 취소'
            )}
          </button>
        ) : null}

        {cancelMutation.error ? (
          <div className="reservation-panel__error">
            <ErrorMessage error={cancelMutation.error} />
          </div>
        ) : null}
      </aside>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        ariaLabel="예약 취소 확인"
        maxWidth={420}
      >
        <div className="cancel-confirm">
          <h2 className="cancel-confirm__title">예약을 취소할까요?</h2>
          <p className="cancel-confirm__desc">
            <strong>{reservation.roomName}</strong>
            <br />
            {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
          </p>
          <p className="cancel-confirm__note">
            취소 후에는 되돌릴 수 없으며, 환불 금액은 숙소의 취소 정책에 따라 결정됩니다.
          </p>
          <div className="cancel-confirm__actions">
            <button type="button" className="secondary-button" onClick={() => setConfirmCancel(false)}>
              돌아가기
            </button>
            <button type="button" className="danger-button" onClick={handleCancel}>
              예약 취소
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

// 결제 마감 카운트다운. 0 이 되면 onExpire 를 한 번만 호출해 (서버 호출 없이) 만료 화면으로 전환한다.
// targetMs(숫자)와 onExpire(useCallback)는 렌더마다 안정적이라 effect 가 재실행되지 않는다.
function Countdown({ targetMs, onExpire }: { targetMs: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(() => targetMs - Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    const tick = () => {
      const left = targetMs - Date.now();
      setRemaining(left);
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetMs, onExpire]);

  if (remaining <= 0) return null;
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const urgent = remaining < 60000;

  return (
    <div className={`reservation-countdown${urgent ? ' reservation-countdown--urgent' : ''}`}>
      <span className="reservation-countdown__label">결제 마감까지</span>
      <span className="reservation-countdown__time">
        {m}:{String(s).padStart(2, '0')}
      </span>
    </div>
  );
}
