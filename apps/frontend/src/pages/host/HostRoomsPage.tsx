import { Link } from 'react-router-dom';
import { Home, CheckCircle2, PauseCircle, Plus } from 'lucide-react';
import {
  useHostRoomsQuery,
  useUpdateHostRoomStatusMutation,
} from '../../features/host/api/hostQueries';
import { HostRoomList } from '../../features/host/ui/HostRoomList';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { Loading } from '../../shared/ui/Loading';

export function HostRoomsPage() {
  const hostRoomsQuery = useHostRoomsQuery();
  const statusMutation = useUpdateHostRoomStatusMutation();

  const rooms = hostRoomsQuery.data ?? [];
  const activeCount = rooms.filter((room) => room.status === 'ACTIVE').length;
  const inactiveCount = rooms.length - activeCount;

  return (
    <section className="stack">
      <div className="row-between">
        <div className="page-heading">
          <p className="eyebrow">Host</p>
          <h1>호스트 숙소 관리</h1>
          <p className="muted">등록한 숙소의 운영 상태를 관리하고 정보를 수정하세요.</p>
        </div>
        <Link className="primary-button inline-action" to="/host/rooms/new">
          <Plus size={18} strokeWidth={2.4} aria-hidden />
          숙소 등록
        </Link>
      </div>

      {rooms.length > 0 ? (
        <div className="metric-grid">
          <div className="metric">
            <span className="metric-icon">
              <Home size={20} strokeWidth={1.9} aria-hidden />
            </span>
            <div>
              <p className="metric-label">전체 숙소</p>
              <strong className="metric-value">{rooms.length}</strong>
            </div>
          </div>
          <div className="metric">
            <span className="metric-icon is-active">
              <CheckCircle2 size={20} strokeWidth={1.9} aria-hidden />
            </span>
            <div>
              <p className="metric-label">운영 중</p>
              <strong className="metric-value">{activeCount}</strong>
            </div>
          </div>
          <div className="metric">
            <span className="metric-icon is-muted">
              <PauseCircle size={20} strokeWidth={1.9} aria-hidden />
            </span>
            <div>
              <p className="metric-label">비활성 · 대기</p>
              <strong className="metric-value">{inactiveCount}</strong>
            </div>
          </div>
        </div>
      ) : null}

      {hostRoomsQuery.isLoading ? <Loading message="호스트 숙소를 불러오는 중입니다." /> : null}
      {hostRoomsQuery.error ? <ErrorMessage error={hostRoomsQuery.error} /> : null}
      {statusMutation.error ? <ErrorMessage error={statusMutation.error} /> : null}
      {hostRoomsQuery.data ? (
        <HostRoomList
          rooms={hostRoomsQuery.data}
          pendingRoomId={statusMutation.isPending ? statusMutation.variables?.roomId : undefined}
          onStatusChange={(roomId, status) => statusMutation.mutate({ roomId, status })}
        />
      ) : null}
    </section>
  );
}
