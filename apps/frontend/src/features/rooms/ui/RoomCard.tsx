import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/format';
import { RoomSummary } from '../model/roomTypes';

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
            <span className="card-meta">
              <Star size={14} fill="currentColor" />
              {room.rating.toFixed(1)}
            </span>
          </div>
          <p className="muted">{room.region} · 최대 {room.maxGuests}명</p>
          <p className="room-price">
            {formatCurrency(room.pricePerNight)}
            <span> / 박</span>
          </p>
          <p className="muted">리뷰 {room.reviewCount}개</p>
        </div>
      </Link>
    </article>
  );
}
