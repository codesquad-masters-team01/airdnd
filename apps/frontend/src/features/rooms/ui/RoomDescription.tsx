import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { RoomDetail } from '../model/roomTypes';
import { Modal } from '../../../shared/ui/Modal';

// 이 글자 수를 넘으면 본문을 잘라서 보여주고 '더 보기'로 전체를 노출
const PREVIEW_LIMIT = 180;

const textStyle: CSSProperties = {
  margin: 0,
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#222',
  whiteSpace: 'pre-line',
};

const moreButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  marginTop: '12px',
  padding: 0,
  background: 'none',
  border: 'none',
  color: '#222',
  fontSize: '16px',
  fontWeight: 600,
  textDecoration: 'underline',
  cursor: 'pointer',
};

export function RoomDescription({ room }: { room: RoomDetail }) {
  const description = room.description?.trim();
  const [showFull, setShowFull] = useState(false);

  // 설명이 없으면 섹션 자체를 렌더하지 않음
  if (!description) return null;

  // 글자 수 기준으로 미리보기를 자름 (단어 중간이 잘려도 '…'로 자연스럽게 처리)
  const isLong = description.length > PREVIEW_LIMIT;
  const preview = isLong ? `${description.slice(0, PREVIEW_LIMIT).trimEnd()}…` : description;

  return (
    <section style={{ paddingBottom: '32px', borderBottom: '1px solid #ddd', marginBottom: '32px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '14px' }}>숙소 소개</h2>

      <p style={textStyle}>{preview}</p>

      {isLong && (
        <button type="button" onClick={() => setShowFull(true)} style={moreButtonStyle}>
          더 보기 <ChevronRight size={16} />
        </button>
      )}

      <Modal open={showFull} onClose={() => setShowFull(false)} ariaLabel="숙소 소개" maxWidth={640}>
        {/* 헤더: 아이콘 + 타이틀, 아래 구분선 */}
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
            <Home size={20} strokeWidth={1.8} style={{ color: '#222' }} />
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#222' }}>숙소 소개</h2>
        </div>

        {/* 본문: 길어지면 모달 안에서 스크롤 */}
        <div
          style={{
            maxHeight: 'min(60vh, 520px)',
            overflowY: 'auto',
            paddingTop: '20px',
            paddingRight: '4px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#3a3a3a',
              whiteSpace: 'pre-line',
            }}
          >
            {description}
          </p>
        </div>
      </Modal>
    </section>
  );
}
