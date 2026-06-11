import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ChevronRight } from 'lucide-react';
import { RoomDetail } from '../model/roomTypes';
import { getAmenityIcon } from '../model/amenities';
import { Modal } from '../../../shared/ui/Modal';

// 가로 2개씩 4줄 = 8개까지만 먼저 보여주고, 그 이상은 '모두 보기'로 모달에서 전체를 본다
const INITIAL_VISIBLE_COUNT = 8;

const itemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '16px 18px',
  border: '1px solid #ebebeb',
  borderRadius: '14px',
  fontSize: '16px',
  color: '#222',
  backgroundColor: '#fff',
};

const moreButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  marginTop: '24px',
  justifySelf: 'start',
  width: 'fit-content',
  padding: '13px 23px',
  background: 'none',
  border: '1px solid #222',
  borderRadius: '8px',
  color: '#222',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
};

const iconWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  backgroundColor: '#f7f7f7',
  color: '#222',
  flexShrink: 0,
};

function AmenityItem({ amenity }: { amenity: string }) {
  const Icon = getAmenityIcon(amenity);
  return (
    <div style={itemStyle}>
      <span style={iconWrapStyle}>
        <Icon size={20} strokeWidth={1.8} />
      </span>
      {amenity}
    </div>
  );
}

export function RoomAmenities({ room }: { room: RoomDetail }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!room.amenities || room.amenities.length === 0) return null;

  const amenities = room.amenities;
  const hasMore = amenities.length > INITIAL_VISIBLE_COUNT;
  const visibleAmenities = amenities.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <section>
      <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>숙소 편의시설</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {visibleAmenities.map((amenity) => (
          <AmenityItem key={amenity} amenity={amenity} />
        ))}
      </div>

      {hasMore && (
        <button type="button" onClick={() => setIsModalOpen(true)} style={moreButtonStyle}>
          편의시설 {amenities.length}개 모두 보기 <ChevronRight size={16} />
        </button>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ariaLabel="편의시설 전체 보기"
        maxWidth={680}
      >
        {/* 헤더 */}
        <div
          style={{
            paddingBottom: '20px',
            paddingRight: '36px',
            marginBottom: '4px',
            borderBottom: '1px solid #ebebeb',
            fontSize: '20px',
            fontWeight: 700,
            color: '#222',
          }}
        >
          편의시설 {amenities.length}개
        </div>

        {/* 본문: 전체 편의시설을 2열로, 길어지면 모달 안에서 스크롤 */}
        <div
          style={{
            maxHeight: 'min(64vh, 560px)',
            overflowY: 'auto',
            paddingTop: '20px',
            paddingRight: '4px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {amenities.map((amenity) => (
              <AmenityItem key={amenity} amenity={amenity} />
            ))}
          </div>
        </div>
      </Modal>
    </section>
  );
}
