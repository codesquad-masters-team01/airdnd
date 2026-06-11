import { Star } from 'lucide-react';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useRoomReviewsQuery } from '../api/reviewsQueries';

// 평점(0~5)에 비례해 5개의 별을 부분적으로 채워 그리는 컴포넌트
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100));
  const stars = [0, 1, 2, 3, 4];

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {/* 바탕: 비어 있는(회색) 별 */}
      <span style={{ display: 'inline-flex', gap: '2px', color: '#dddddd' }}>
        {stars.map((i) => (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} style={{ flexShrink: 0 }} />
        ))}
      </span>
      {/* 덧칠: 평점만큼 가로로 잘라낸 채워진 별 */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'inline-flex',
          gap: '2px',
          width: `${percent}%`,
          overflow: 'hidden',
          color: '#222',
        }}
      >
        {stars.map((i) => (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} style={{ flexShrink: 0 }} />
        ))}
      </span>
    </span>
  );
}

interface RoomReviewSummaryButtonProps {
  roomId: number;
  fullWidth?: boolean; // 가로 전체로 늘릴지 여부
}

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 18px',
  backgroundColor: '#fff',
  border: '1px solid #222',
  borderRadius: '10px',
  color: '#222',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
};

// 후기 섹션으로 부드럽게 스크롤 이동
function scrollToReviews() {
  document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function RoomReviewSummaryButton({ roomId, fullWidth = false }: RoomReviewSummaryButtonProps) {
  const { data: reviews, isLoading } = useRoomReviewsQuery(roomId);

  const summary = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;

    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return {
      rating: Math.round((sum / reviews.length) * 10) / 10,
      reviewCount: reviews.length,
    };
  }, [reviews]);

  // 로딩 중이거나 후기가 없으면 버튼을 노출하지 않음
  if (isLoading || !summary) return null;

  // 가로로 늘릴 때는 '에어디엔디 선정' 배너 형태:
  // 좌측에 선정 문구, 우측에 [평점(숫자+별) | 후기]를 세로 구분선으로 구분
  if (fullWidth) {
    return (
      <button
        type="button"
        onClick={scrollToReviews}
        style={{
          ...buttonStyle,
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          padding: '18px 22px',
        }}
      >
        {/* 좌측: 선정 문구 */}
        <span style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.35 }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#717171' }}>에어디엔디 선정</span>
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#222' }}>
            게스트에게 가장 사랑받는 숙소
          </span>
        </span>

        {/* 우측: 평점 | 후기 */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '18px' }}>
          {/* 평점: 위 숫자, 아래 별 */}
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#222', lineHeight: 1 }}>
              {summary.rating.toFixed(1)}
            </span>
            <StarRating rating={summary.rating} />
          </span>

          {/* 평점과 후기 사이 세로 구분선 */}
          <span style={{ width: '1px', height: '36px', backgroundColor: '#dddddd' }} />

          {/* 후기: 위 개수, 아래 라벨 */}
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#222', lineHeight: 1 }}>
              {summary.reviewCount}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#222', textDecoration: 'underline' }}>
              후기
            </span>
          </span>
        </span>
      </button>
    );
  }

  return (
    <button type="button" onClick={scrollToReviews} style={buttonStyle}>
      <Star size={16} fill="#222" strokeWidth={0} />
      <span>{summary.rating.toFixed(1)}</span>
      <span style={{ color: '#717171', fontWeight: 500 }}>·</span>
      <span style={{ textDecoration: 'underline' }}>후기 {summary.reviewCount}개</span>
    </button>
  );
}
