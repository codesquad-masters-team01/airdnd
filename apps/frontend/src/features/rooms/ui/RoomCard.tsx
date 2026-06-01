import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../shared/lib/format';
import { RoomSummary } from '../model/roomTypes';

export function RoomCard({ room }: { room: RoomSummary }) {
  return (
    <article className="room-card">
      <Link to={`/rooms/${room.id}`}>
        <img src={room.imageUrl} alt={`${room.name} 대표 이미지`} />
        <div className="room-card-body">
          <div>
            <h2>{room.name}</h2>
            <p className="muted">{room.region}</p>
          </div>
          <p className="room-price">
            {formatCurrency(room.pricePerNight)}
            <span> / 박</span>
          </p>
          <p className="muted">
            평점 {room.rating.toFixed(1)} · 리뷰 {room.reviewCount}개 · 최대 {room.maxGuests}명
          </p>
        </div>
      </Link>
    </article>
  );
}
