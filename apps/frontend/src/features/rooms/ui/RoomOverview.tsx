import { MapPin, UserRound } from 'lucide-react';
import { RoomDetail } from '../model/roomTypes';

export function RoomOverview({ room }: { room: RoomDetail }) {
  return (
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
  );
}
