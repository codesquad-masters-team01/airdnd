import { useRoomReviewsQuery } from '../api/reviewsQueries';
import { ReviewItem } from './ReviewItem';
import { Loading } from '../../../shared/ui/Loading';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';

interface ReviewListProps {
  roomId: number;
}

export function ReviewList({ roomId }: ReviewListProps) {
  const { data: reviews, isLoading, error } = useRoomReviewsQuery(roomId);

  if (isLoading) {
    return <Loading message="후기를 불러오는 중입니다." />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="empty-reviews" style={{ padding: '2rem 0', color: '#666' }}>
        아직 작성된 후기가 없습니다.
      </div>
    );
  }

  return (
    <div className="review-list">
      <h2 style={{ marginBottom: '1.5rem' }}>후기 {reviews.length}개</h2>
      <div className="review-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
