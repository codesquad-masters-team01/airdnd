import { useParams } from 'react-router-dom';
import { ReservationForm } from '../../features/reservations/ui/ReservationForm';
import { useRoomQuery } from '../../features/rooms/api/roomsQueries';
import { formatCurrency } from '../../shared/lib/format';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { Loading } from '../../shared/ui/Loading';

export function RoomDetailPage() {
  const { roomId } = useParams();
  const parsedRoomId = Number(roomId);
  const roomQuery = useRoomQuery(parsedRoomId);

  if (roomQuery.isLoading) {
    return <Loading message="숙소 상세 정보를 불러오는 중입니다." />;
  }

  if (roomQuery.error) {
    return <ErrorMessage error={roomQuery.error} />;
  }

  if (!roomQuery.data) {
    return null;
  }

  const room = roomQuery.data;

  return (
    <section className="detail-layout">
      <article className="stack">
        <img className="detail-hero" src={room.imageUrl} alt={`${room.name} 대표 이미지`} />
        <div className="page-heading">
          <p className="eyebrow">{room.region}</p>
          <h1>{room.name}</h1>
          <p className="muted">{room.address}</p>
        </div>
        <div className="info-row">
          <span>호스트 {room.hostName}</span>
          <span>평점 {room.rating.toFixed(1)}</span>
          <span>리뷰 {room.reviewCount}개</span>
          <span>최대 {room.maxGuests}명</span>
        </div>
        <p>{room.description}</p>
        <div>
          <h2>편의시설</h2>
          <div className="tag-list">
            {room.amenities.map((amenity) => (
              <span className="tag" key={amenity}>
                {amenity}
              </span>
            ))}
          </div>
        </div>
        <p className="room-price">{formatCurrency(room.pricePerNight)} / 박</p>
      </article>
      <ReservationForm room={room} />
    </section>
  );
}
