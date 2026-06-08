import { Star } from 'lucide-react';
import { useRoomReviewSummaryQuery } from '../api/reviewsQueries';

interface RoomReviewBadgeProps {
  roomId: number;
  showReviewCount?: boolean; // 메인 리스트에선 숨기고 상세 페이지에선 보이게 제어 가능
}

export function RoomReviewBadge({ roomId, showReviewCount = true }: RoomReviewBadgeProps) {
  const { data: summary, isLoading, isError } = useRoomReviewSummaryQuery(roomId);

  if (isLoading) {
    return (
      <div className="card-meta" style={{ gap: '4px', opacity: 0.5 }}>
        <Star size={14} fill="#ddd" color="#ddd" />
        <span style={{ width: '24px', height: '14px', backgroundColor: '#eee', borderRadius: '4px' }}></span>
      </div>
    );
  }

  if (isError || !summary || summary.reviewCount === 0) {
    return (
      <div className="card-meta">
        <span className="muted" style={{ fontSize: '0.85rem' }}>신규 (리뷰 없음)</span>
      </div>
    );
  }

  return (
    <>
      <span className="card-meta">
        <Star size={14} fill="currentColor" />
        {summary.rating.toFixed(1)}
      </span>
      {showReviewCount && (
        <p className="muted" style={{ fontSize: '0.85rem' }}>리뷰 {summary.reviewCount}개</p>
      )}
    </>
  );
}