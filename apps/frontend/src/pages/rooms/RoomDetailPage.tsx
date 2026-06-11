import { useParams } from 'react-router-dom';
import { ReservationForm } from '../../features/reservations/ui/ReservationForm';
import { useRoomQuery } from '../../features/rooms/api/roomsQueries';
import { RoomDetailHeader } from '../../features/rooms/ui/RoomDetailHeader';
import { RoomGallery } from '../../features/rooms/ui/RoomGallery';
import { RoomOverview } from '../../features/rooms/ui/RoomOverview';
import { RoomDescription } from '../../features/rooms/ui/RoomDescription';
import { RoomAmenities } from '../../features/rooms/ui/RoomAmenities';
import { RoomLocation } from '../../features/rooms/ui/RoomLocation';
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

  // 첫 번째 이미지를 대표로, 나머지를 사이드(최대 4개)로 사용합니다.
  const allImages = room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls : [room.imageUrl];
  const heroImage = allImages[0];
  const sideImages = allImages.slice(1, 5);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingTop: '0', marginTop: '-40px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px' }}>

        {/* A. 제목 및 액션 버튼 */}
        <RoomDetailHeader room={room} />

        {/* B. 와이드 사진 갤러리 */}
        <RoomGallery room={room} />

        {/* 사진 영역과 본문을 구분하는 라인 */}
        <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '0 0 32px' }} />

        {/* 메인 레이아웃 (좌: 정보 / 우: 예약창) — 예약 폼은 이 그리드 안에서만 따라온다 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 372px', gap: '80px', position: 'relative' }}>

          {/* 좌측: 숙소 정보 */}
          <article>
            {/* C. 호스트 정보 + 숙소 하이라이트 */}
            <RoomOverview room={room} />

            {/* D. 설명 */}
            <RoomDescription room={room} />

            {/* E. 편의시설 */}
            <RoomAmenities room={room} />
          </article>

          {/* H. 우측: 스티키 예약 폼 */}
          <aside style={{ position: 'relative' }}>
            <div style={{ position: 'sticky', top: '100px' }}>
              <ReservationForm room={room} />
            </div>
          </aside>

        </div>

        {/* 편의시설과 위치 사이 전체 너비 구분선 */}
        <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '48px 0' }} />

        {/* F. 숙소 위치 (실제 지도 연동) — 전체 너비 */}
        <RoomLocation room={room} />

        {/* G. 후기 섹션 — 전체 너비 */}
        <section id="reviews" style={{ paddingTop: '16px', paddingBottom: '48px' }}>
          <ReviewList roomId={parsedRoomId} />
        </section>
      </div>
    </div>
  );
}
