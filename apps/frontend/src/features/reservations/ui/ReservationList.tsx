import { useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronDown, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../../shared/lib/format';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Modal } from '../../../shared/ui/Modal';
import { StatusBadge, StatusBadgeTone } from '../../../shared/ui/StatusBadge';
import { Reservation, ReservationStatus } from '../model/reservationTypes';

type ReservationListProps = {
  reservations: Reservation[];
  onCancel: (reservationId: number) => void;
  /** 현재 취소 요청이 진행 중인 예약 id (해당 카드에만 로딩 표시) */
  cancelingId?: number | null;
};

const statusText: Record<ReservationStatus, string> = {
  PENDING: '대기',
  CONFIRMED: '확정',
  CANCELLED: '취소',
};

const statusTone: Record<ReservationStatus, StatusBadgeTone> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'neutral',
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// 가로 2개 × 2줄 = 스크롤 없이 보여줄 카드 수. 이보다 많으면 고정 높이 안에서 내부 스크롤로 나머지를 본다(취소 목록과 동일한 방식)
const VISIBLE_CARDS = 4;

// 'YYYY-MM-DD' 문자열은 사전식 비교가 곧 날짜 비교 — 로컬 자정 기준 오늘 날짜를 같은 형식으로 생성
function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function nightsBetween(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(diff / MS_PER_DAY));
}

// 깨졌거나 비어 있는 대표 이미지를 대체할 중립 플레이스홀더 (data URI라 onError 무한 루프 없음)
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="132" height="99">' +
      '<rect width="100%" height="100%" fill="#f0f0f0"/>' +
      '<text x="50%" y="50%" fill="#bbbbbb" font-family="sans-serif" font-size="12" ' +
      'text-anchor="middle" dominant-baseline="middle">이미지 없음</text></svg>',
  );

export function ReservationList({ reservations, onCancel, cancelingId = null }: ReservationListProps) {
  // 취소 확인 모달 대상 (null이면 닫힘)
  const [confirmTarget, setConfirmTarget] = useState<Reservation | null>(null);
  // 취소 예약 목록 펼침 여부 (기본 접힘 — 취소가 많아도 화면이 늘어나지 않게)
  const [showCancelled, setShowCancelled] = useState(false);
  if (reservations.length === 0) {
    return (
      <EmptyState
        title="예약 내역이 없습니다."
        description="마음에 드는 숙소를 찾아 첫 예약을 만들어보세요."
        action={
          <Link to="/" className="primary-button inline-action">
            숙소 둘러보기
          </Link>
        }
      />
    );
  }

  const today = localToday();
  const confirmedCount = reservations.filter((r) => r.status === 'CONFIRMED').length;
  const cancelledCount = reservations.filter((r) => r.status === 'CANCELLED').length;

  // 다가오는 예약: 취소되지 않았고 체크아웃이 아직 지나지 않은 것 → 체크인 임박순
  const upcoming = reservations
    .filter((r) => r.status !== 'CANCELLED' && r.checkOut >= today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  // 지난 예약: 취소되지 않았고 체크아웃이 지난 것 → 최근 체크아웃순
  const past = reservations
    .filter((r) => r.status !== 'CANCELLED' && r.checkOut < today)
    .sort((a, b) => b.checkOut.localeCompare(a.checkOut));
  // 취소 예약: 기본적으로 접어두고 토글로만 노출 → 최근 체크아웃순
  const cancelled = reservations
    .filter((r) => r.status === 'CANCELLED')
    .sort((a, b) => b.checkOut.localeCompare(a.checkOut));

  const renderItem = (reservation: Reservation, cancellable: boolean) => {
    const nights = nightsBetween(reservation.checkIn, reservation.checkOut);
    const isCancelled = reservation.status === 'CANCELLED';
    const isCanceling = cancelingId === reservation.id;
    const cardClass = [
      'reservation-item',
      isCancelled ? 'is-cancelled' : '',
      !cancellable && !isCancelled ? 'is-past' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <article className={cardClass} key={reservation.id}>
        <img
          src={reservation.roomUrl || FALLBACK_IMAGE}
          alt={`${reservation.roomName} 대표 이미지`}
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="reservation-content">
          <Link to={`/reservations/${reservation.id}`}>
            <h2>{reservation.roomName}</h2>
          </Link>
          {reservation.region ? <p className="reservation-region">{reservation.region}</p> : null}
          <p className="muted reservation-dates">
            {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
          </p>
          <p className="muted reservation-meta">
            {nights}박 · {reservation.guests}명
          </p>
          <div className="reservation-price">
            <strong>{formatCurrency(reservation.totalPrice)}</strong>
            <span className="muted">{formatCurrency(reservation.pricePerNight)} · 1박</span>
          </div>
        </div>
        <div className="reservation-actions">
          <StatusBadge tone={statusTone[reservation.status]}>{statusText[reservation.status]}</StatusBadge>
          {cancellable ? (
            <button
              type="button"
              className="secondary-button"
              disabled={isCanceling}
              aria-label={`${reservation.roomName} 예약 취소`}
              onClick={() => setConfirmTarget(reservation)}
            >
              {isCanceling ? (
                <>
                  <span className="button-spinner" aria-hidden="true" />
                  취소 중…
                </>
              ) : (
                '예약 취소'
              )}
            </button>
          ) : null}
        </div>
      </article>
    );
  };

  // 다가오는/지난 그룹 공통 렌더 — 카드가 VISIBLE_CARDS(4개)보다 많으면 2줄 높이로 고정하고 내부 스크롤로 나머지를 본다
  const renderGroup = (title: string, items: Reservation[], cancellable: boolean) => {
    const scrollable = items.length > VISIBLE_CARDS;
    return (
      <section className="reservation-group">
        <h2 className="reservation-group__title">
          {title} <span className="reservation-group__count">{items.length}건</span>
        </h2>
        <div className={`reservation-group__cards${scrollable ? ' reservation-group__cards--scroll' : ''}`}>
          {items.map((reservation) => renderItem(reservation, cancellable))}
        </div>
      </section>
    );
  };

  return (
    <div className="list-stack">
      <div className="metric-grid">
        <div className="metric">
          <span className="metric-icon">
            <CalendarDays size={20} strokeWidth={1.9} aria-hidden />
          </span>
          <div>
            <p className="metric-label">전체</p>
            <strong className="metric-value">{reservations.length}</strong>
          </div>
        </div>
        <div className="metric">
          <span className="metric-icon is-active">
            <CheckCircle2 size={20} strokeWidth={1.9} aria-hidden />
          </span>
          <div>
            <p className="metric-label">확정</p>
            <strong className="metric-value">{confirmedCount}</strong>
          </div>
        </div>
        <div className="metric">
          <span className="metric-icon is-cancelled">
            <XCircle size={20} strokeWidth={1.9} aria-hidden />
          </span>
          <div>
            <p className="metric-label">취소</p>
            <strong className="metric-value">{cancelledCount}</strong>
          </div>
        </div>
      </div>

      {/* 다가오는(확정) 예약 — 없으면 빈 자리 대신 안내 카드를 둔다 */}
      {upcoming.length > 0 ? (
        renderGroup('다가오는 예약', upcoming, true)
      ) : (
        <section className="reservation-group">
          <h2 className="reservation-group__title">다가오는 예약</h2>
          <EmptyState
            title="예정된 예약이 없어요."
            description="새로운 숙소를 둘러보고 다음 여행을 계획해보세요."
            action={
              <Link to="/" className="primary-button inline-action">
                숙소 보러가기
              </Link>
            }
          />
        </section>
      )}

      {/* 지난 예약 */}
      {past.length > 0 ? renderGroup('지난 예약', past, false) : null}

      {/* 취소 예약: 전체 폭으로 하단에 두되 기본은 접어둠 */}
      {cancelled.length > 0 ? (
        <section className="reservation-cancelled">
          <button
            type="button"
            className="reservation-cancelled__toggle"
            aria-expanded={showCancelled}
            onClick={() => {
              // 펼쳐 둔 목록을 다시 접을 때는 한참 내려와 있을 수 있으니 페이지 맨 위로 올려준다
              if (showCancelled) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              setShowCancelled((open) => !open);
            }}
          >
            <span>취소된 예약 {cancelled.length}건</span>
            <ChevronDown
              size={18}
              className={`reservation-cancelled__chevron${showCancelled ? ' is-open' : ''}`}
              aria-hidden="true"
            />
          </button>
          {showCancelled ? (
            <div className="reservation-cancelled__list">
              {cancelled.map((reservation) => renderItem(reservation, false))}
            </div>
          ) : null}
        </section>
      ) : null}

      <Modal
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        ariaLabel="예약 취소 확인"
        maxWidth={420}
      >
        {confirmTarget ? (
          <div className="cancel-confirm">
            <h2 className="cancel-confirm__title">예약을 취소할까요?</h2>
            <p className="cancel-confirm__desc">
              <strong>{confirmTarget.roomName}</strong>
              <br />
              {formatDate(confirmTarget.checkIn)} - {formatDate(confirmTarget.checkOut)}
            </p>
            <p className="cancel-confirm__note">
              취소 후에는 되돌릴 수 없으며, 환불 금액은 숙소의 취소 정책에 따라 결정됩니다.
            </p>
            <div className="cancel-confirm__actions">
              <button type="button" className="secondary-button" onClick={() => setConfirmTarget(null)}>
                돌아가기
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  onCancel(confirmTarget.id);
                  setConfirmTarget(null);
                }}
              >
                예약 취소
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
