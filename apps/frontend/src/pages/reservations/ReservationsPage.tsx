import { useState } from 'react';
import { Check } from 'lucide-react';
import { useCancelReservationMutation, useReservationsQuery } from '../../features/reservations/api/reservationsQueries';
import { ReservationList } from '../../features/reservations/ui/ReservationList';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { Loading } from '../../shared/ui/Loading';
import { Modal } from '../../shared/ui/Modal';

export function ReservationsPage() {
  const reservationsQuery = useReservationsQuery();
  const cancelMutation = useCancelReservationMutation();
  // 어떤 예약을 취소 중인지 추적해 해당 카드에만 로딩을 표시
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  // 취소 완료 배너 노출 여부 (닫기 버튼으로 직접 닫을 수 있도록 상태로 관리)
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);

  const handleCancel = (reservationId: number) => {
    setCancelingId(reservationId);
    cancelMutation.mutate(reservationId, {
      onSuccess: () => setShowCancelSuccess(true),
      onSettled: () => setCancelingId(null),
    });
  };

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Reservations</p>
        <h1>예약 목록</h1>
      </div>
      {reservationsQuery.isLoading ? <Loading message="예약 목록을 불러오는 중입니다." /> : null}
      {reservationsQuery.error ? <ErrorMessage error={reservationsQuery.error} /> : null}
      {cancelMutation.error ? <ErrorMessage error={cancelMutation.error} /> : null}
      {reservationsQuery.data ? (
        <ReservationList
          reservations={reservationsQuery.data}
          cancelingId={cancelingId}
          onCancel={handleCancel}
        />
      ) : null}

      {/* 취소 완료 안내 — 확인을 누르면 닫히며 예약 목록이 보인다 */}
      <Modal
        open={showCancelSuccess && cancelingId === null}
        onClose={() => setShowCancelSuccess(false)}
        ariaLabel="예약 취소 완료"
        maxWidth={420}
      >
        <div className="cancel-success">
          <div className="cancel-success__icon" aria-hidden="true">
            <Check size={32} strokeWidth={3} />
          </div>
          <h2 className="cancel-success__title">예약이 취소되었습니다</h2>
          <p className="cancel-success__desc">환불 금액은 숙소의 취소 정책에 따라 결정됩니다.</p>
          <button
            type="button"
            className="primary-button full-width"
            onClick={() => {
              setShowCancelSuccess(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            확인
          </button>
        </div>
      </Modal>
    </section>
  );
}
