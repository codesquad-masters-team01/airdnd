import { RoomDetail } from '../model/roomTypes';

export function RoomGallery({ room }: { room: RoomDetail }) {
  // 첫 번째 이미지를 대표로, 나머지를 사이드로 (중복 필터링 제거하여 데이터 유실 방지)
  const allImages = room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls : [room.imageUrl];
  const heroImage = allImages[0];
  const sideImages = allImages.slice(1, 5);

  return (
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
  );
}
