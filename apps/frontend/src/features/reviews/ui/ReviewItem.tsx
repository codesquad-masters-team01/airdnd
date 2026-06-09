import { Star, UserCircle2 } from 'lucide-react';
import { Review } from '../model/reviewTypes';
import { formatDate } from '../../../shared/lib/format';

interface ReviewItemProps {
  review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <div className="review-item" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
      <div className="review-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <UserCircle2 size={32} color="#aaa" />
        <div>
          <div className="review-author" style={{ fontWeight: 'bold' }}>
            {review.authorName || '익명'}
          </div>
          <div className="review-date" style={{ fontSize: '0.85rem', color: '#666' }}>
            {formatDate(review.createdAt)}
          </div>
        </div>
      </div>
      <div className="review-rating" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.5rem' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < review.rating ? '#FF385C' : 'transparent'}
            color={i < review.rating ? '#FF385C' : '#ccc'}
          />
        ))}
      </div>
      <div className="review-comment" style={{ lineHeight: '1.4' }}>
        {review.comment}
      </div>
    </div>
  );
}
