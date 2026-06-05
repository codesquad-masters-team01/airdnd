import { useParams } from 'react-router-dom';
import { MapPin, Star, UserRound } from 'lucide-react';
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
      <article className="stack detail-content">
        <div className="detail-gallery">
          <img className="detail-hero" src={room.imageUrl} alt={`${room.name} 대표 이미지`} />
          <div className="detail-gallery-side" aria-hidden="true">
            {room.imageUrls && room.imageUrls.length > 0 ? (
              <>
                <img className="detail-gallery-tile" src={room.imageUrls[0]} alt="" />
                {room.imageUrls[1] ? (
                  <img className="detail-gallery-tile" src={room.imageUrls[1]} alt="" />
                ) : (
                  <img className="detail-gallery-tile" src={room.imageUrl} alt="" />
                )}
              </>
            ) : (
              <>
                <img className="detail-gallery-tile tint" src={room.imageUrl} alt="" />
                <img className="detail-gallery-tile" src={room.imageUrl} alt="" />
              </>
            )}
          </div>
        </div>
        <div className="detail-header">
          <div className="page-heading">
            <p className="eyebrow">{room.region}</p>
            <h1>{room.name}</h1>
            <p className="muted">
              <MapPin size={16} /> {room.address}
            </p>
          </div>
          <div className="info-row">
            <span>
              <UserRound size={16} /> 호스트 {room.hostName}
            </span>
            <span>
              <Star size={16} fill="currentColor" /> {room.rating.toFixed(1)}
            </span>
            <span>리뷰 {room.reviewCount}개</span>
            <span>최대 {room.maxGuests}명</span>
          </div>
        </div>
        <div className="content-section">
          <h2>숙소 소개</h2>
          <p>{room.description}</p>
        </div>
        <div className="content-section">
          <h2>편의시설</h2>
          <div className="tag-list">
            {room.amenities.map((amenity) => (
              <span className="tag" key={amenity}>
                {amenity}
              </span>
            ))}
          </div>
        </div>
        <div className="content-section">
          <h2>요금</h2>
          <p className="room-price">{formatCurrency(room.pricePerNight)} / 박</p>
        </div>
      </article>
      <ReservationForm room={room} />
    </section>
  );
}
