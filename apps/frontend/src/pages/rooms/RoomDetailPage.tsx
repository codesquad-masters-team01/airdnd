import { useParams } from 'react-router-dom';
import { MapPin, UserRound, Share, Heart } from 'lucide-react';
import { ReservationForm } from '../../features/reservations/ui/ReservationForm';
import { useRoomQuery } from '../../features/rooms/api/roomsQueries';
import { RoomReviewBadge } from '../../features/reviews/ui/RoomReviewBadge';
import { ReviewList } from '../../features/reviews/ui/ReviewList';
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
  
  // 첫 번째 이미지를 대표로, 나머지를 사이드로 (중복 필터링 제거하여 데이터 유실 방지)
  const allImages = room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls : [room.imageUrl];
  const heroImage = allImages[0];
  const sideImages = allImages.slice(1, 5);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingTop: '0', marginTop: '-40px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* 1. 제목 및 액션 버튼 섹션 - 헤더 바로 아래 밀착 */}
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingTop: '24px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#222', marginBottom: '8px' }}>{room.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RoomReviewBadge roomId={parsedRoomId} showReviewCount={true} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '8px', borderRadius: '8px' }}>
              <Share size={16} /> 공유하기
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '8px', borderRadius: '8px' }}>
              <Heart size={16} /> 저장
            </button>
          </div>
        </section>

        {/* 2. 와이드 사진 갤러리 - 좌측 1개(50%) : 우측 4개(50%, 2x2 그리드) */}
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '8px', 
          height: '500px', 
          borderRadius: '12px', 
          overflow: 'hidden',
          marginBottom: '48px',
          backgroundColor: '#f7f7f7'
        }}>
          {/* 대표 사진 (Hero) */}
          <div style={{ width: '100%', height: '100%' }}>
            <img src={heroImage} alt="대표" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* 사이드 2x2 그리드 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gridTemplateRows: 'repeat(2, 1fr)', 
            gap: '8px', 
            height: '100%',
            minHeight: 0
          }}>
            {sideImages.slice(0, 4).map((img, index) => (
              <div key={index} style={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}>
                <img 
                  src={img} 
                  alt={`추가${index + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                />
              </div>
            ))}
          </div>
        </section>

        {/* 3. 메인 레이아웃 (좌: 정보 / 우: 예약창) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 372px', gap: '80px', position: 'relative' }}>
          
          {/* 좌측: 숙소 정보 */}
          <article>
            <div style={{ paddingBottom: '32px', borderBottom: '1px solid #ddd', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '4px' }}>호스트 {room.hostName}님이 호스팅하는 숙소</h2>
                  <p style={{ color: '#717171', fontSize: '16px', margin: 0 }}>최대 인원 {room.maxGuests}명</p>
                </div>
                <UserRound size={56} strokeWidth={1} style={{ color: '#717171', backgroundColor: '#f0f0f0', borderRadius: '50%', padding: '8px' }} />
              </div>
              
              {/* 주소 정보 - 사용자 프로필과 하단 섹션 사이의 공간 활용 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px' }}>
                  <MapPin size={24} style={{ color: '#222' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>숙소 위치</h3>
                  <p style={{ fontSize: '14px', color: '#717171', margin: 0 }}>{room.address}</p>
                </div>
              </div>
            </div>

            <section style={{ paddingBottom: '32px', borderBottom: '1px solid #ddd', marginBottom: '32px' }}>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#222', whiteSpace: 'pre-line' }}>{room.description}</p>
            </section>

            <section style={{ paddingBottom: '32px', borderBottom: '1px solid #ddd', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>숙소 편의시설</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {room.amenities.map((amenity) => (
                  <div key={amenity} style={{ fontSize: '16px', color: '#222', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {amenity}
                  </div>
                ))}
              </div>
            </section>

            {/* 후기 섹션 */}
            <section id="reviews" style={{ paddingTop: '16px', paddingBottom: '48px' }}>
              <ReviewList roomId={parsedRoomId} />
            </section>
          </article>

          {/* 우측: 스티키 예약 폼 */}
          <aside style={{ position: 'relative' }}>
            <div style={{ position: 'sticky', top: '100px', marginBottom: '48px' }}>
              <ReservationForm room={room} />
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}
