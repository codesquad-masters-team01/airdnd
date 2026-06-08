import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/format';
import { RoomSummary } from '../model/roomTypes';
import { RoomReviewBadge } from '../../reviews/ui/RoomReviewBadge';

export function RoomCard({ room }: { room: RoomSummary }) {
  return (
    <article className="room-card">
      <Link to={`/rooms/${room.id}`}>
        <div className="room-card-media">
          <img src={room.imageUrl} alt={`${room.name} 대표 이미지`} />
          <span className="icon-button favorite-control" aria-hidden="true">
            <Heart size={18} />
          </span>
        </div>
        <div className="room-card-body">
          <div className="room-card-title-row">
            <h2>{room.name}</h2>
            {/* 개별적으로 리뷰 요약 API를 호출하여 별점 표시 */}
            <RoomReviewBadge roomId={room.id} showReviewCount={false} />
          </div>
          <p className="muted">{room.region} · 최대 {room.maxGuests}명</p>
          <p className="room-price">
            {formatCurrency(room.pricePerNight)}
            <span> / 박</span>
          </p>
          {/* 리뷰 개수는 아래쪽에 별도로 표시되도록 Badge 컴포넌트를 한 번 더 사용하되 rating 표시 부분은 css로 조절하거나 분리 가능, 여기서는 통합된 Badge 사용 */}
          {/* 하단에 리뷰 개수를 보여주려면 위 Badge에서 showReviewCount={true}로 합치거나 분리, 여기선 레이아웃 유지를 위해 통합 */}
        </div>
      </Link>
    </article>
  );
}
