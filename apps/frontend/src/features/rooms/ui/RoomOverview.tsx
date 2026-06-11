import type { ReactNode } from 'react';
import { Baby, PawPrint, Users, UserRound } from 'lucide-react';
import { RoomDetail } from '../model/roomTypes';
import { RoomReviewSummaryButton } from '../../reviews/ui/RoomReviewSummaryButton';

type Highlight = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function RoomOverview({ room }: { room: RoomDetail }) {
  const highlights: Highlight[] = [
    {
      icon: <Users size={26} strokeWidth={1.5} style={{ color: '#222' }} />,
      title: `최대 게스트 ${room.maxGuests}명`,
      description: '편안하게 머무를 수 있는 인원입니다.',
    },
    {
      icon: <PawPrint size={26} strokeWidth={1.5} style={{ color: '#222' }} />,
      title: room.allowsPets ? '반려동물 동반 가능' : '반려동물 동반 불가',
      description: room.allowsPets
        ? '반려동물과 함께 숙박하실 수 있어요.'
        : '반려동물은 동반하실 수 없어요.',
    },
    {
      icon: <Baby size={26} strokeWidth={1.5} style={{ color: '#222' }} />,
      title: room.allowsInfants ? '유아 동반 가능' : '유아 동반 불가',
      description: room.allowsInfants
        ? '유아를 위한 숙박이 가능해요.'
        : '유아 동반은 어려운 숙소예요.',
    },
  ];

  return (
    <div style={{ paddingBottom: '28px', borderBottom: '1px solid #ddd', marginBottom: '28px' }}>
      {/* 호스트 정보 (아이콘 + 이름을 한 줄로 묶어 컴팩트하게) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <UserRound
          size={44}
          strokeWidth={1}
          style={{ color: '#717171', backgroundColor: '#f0f0f0', borderRadius: '50%', padding: '7px', flexShrink: 0 }}
        />
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#222' }}>호스트 {room.hostName}</span>
      </div>

      {/* 평점·후기 요약 버튼 (클릭 시 후기 섹션으로 스크롤) */}
      <div style={{ marginBottom: '20px' }}>
        <RoomReviewSummaryButton roomId={room.id} fullWidth />
      </div>

      {/* 숙소 하이라이트 (가로 2개씩 배치) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {highlights.map((highlight) => (
          <div key={highlight.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '28px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              {highlight.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{highlight.title}</h3>
              <p style={{ fontSize: '14px', color: '#717171', margin: '2px 0 0' }}>{highlight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
