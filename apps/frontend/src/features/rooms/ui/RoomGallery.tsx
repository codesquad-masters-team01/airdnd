import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Grid3x3 } from 'lucide-react';
import { RoomDetail } from '../model/roomTypes';
import { Modal } from '../../../shared/ui/Modal';

export function RoomGallery({ room }: { room: RoomDetail }) {
  // 대표 사진은 필수. 나머지는 추가 사진으로 최대 4장까지 노출
  const allImages = room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls : [room.imageUrl];
  const heroImage = allImages[0];
  const sideImages = allImages.slice(1, 5);
  const sideCount = sideImages.length;

  // 대표 사진 포함 6장 이상일 때만 '사진 모두 모아보기' 버튼 노출 (5장 이하는 미노출)
  const hasMore = allImages.length >= 6;
  const [showAll, setShowAll] = useState(false);

  const sectionStyle: CSSProperties = {
    position: 'relative',
    display: 'grid',
    // 추가 사진이 없으면 대표 사진을 풀너비로
    gridTemplateColumns: sideCount === 0 ? '1fr' : '1fr 1fr',
    gap: '8px',
    height: '500px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '48px',
    backgroundColor: '#f7f7f7',
  };

  // 추가 사진 개수에 따라 우측 그리드 구조를 적응시켜 빈 칸이 생기지 않게 함
  // 1장: 1칸 / 2장: 세로 2칸 / 3~4장: 2x2
  const sideGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: sideCount <= 2 ? '1fr' : '1fr 1fr',
    gridTemplateRows: sideCount <= 1 ? '1fr' : 'repeat(2, 1fr)',
    gap: '8px',
    height: '100%',
    minHeight: 0,
  };

  const showAllButtonStyle: CSSProperties = {
    position: 'absolute',
    right: '16px',
    bottom: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#fff',
    border: '1px solid #222',
    borderRadius: '8px',
    color: '#222',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  };

  return (
    <section style={sectionStyle}>
      {/* 대표 사진 (Hero) */}
      <div style={{ width: '100%', height: '100%' }}>
        <img
          src={heroImage}
          alt={`${room.name} 대표 사진`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* 추가 사진 그리드 (있을 때만) */}
      {sideCount > 0 && (
        <div style={sideGridStyle}>
          {sideImages.map((img, index) => (
            <div key={index} style={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}>
              <img
                src={img}
                alt={`${room.name} 사진 ${index + 2}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 사진 모두 모아보기 버튼 (추가 사진 4장 이상일 때만) */}
      {hasMore && (
        <button type="button" onClick={() => setShowAll(true)} style={showAllButtonStyle}>
          <Grid3x3 size={16} strokeWidth={2} />
          사진 모두 보기
        </button>
      )}

      {/* 전체 사진 모아보기 팝업 */}
      <Modal open={showAll} onClose={() => setShowAll(false)} ariaLabel="사진 모두 보기" maxWidth={880}>
        {/* 헤더: 타이틀, 아래 구분선 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingBottom: '20px',
            marginBottom: '4px',
            borderBottom: '1px solid #ebebeb',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#f7f7f7',
              flexShrink: 0,
            }}
          >
            <Grid3x3 size={20} strokeWidth={1.8} style={{ color: '#222' }} />
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#222' }}>
            사진 {allImages.length}장
          </h2>
        </div>

        {/* 본문: 모든 이미지를 그리드로, 길어지면 모달 안에서 스크롤 */}
        <div
          style={{
            maxHeight: 'min(72vh, 640px)',
            overflowY: 'auto',
            paddingTop: '20px',
            paddingRight: '4px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {allImages.map((img, index) => (
              <div
                key={index}
                style={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#f7f7f7',
                }}
              >
                <img
                  src={img}
                  alt={`${room.name} 사진 ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </section>
  );
}
