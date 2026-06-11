import type { CSSProperties } from 'react';
import { MapPin } from 'lucide-react';
import { RoomDetail } from '../model/roomTypes';

// 추후 지도 API(예: 카카오/구글/Mapbox)를 이 박스에 마운트한다.
// room.latitude / room.longitude 좌표가 이미 준비되어 있음.
const mapBoxStyle: CSSProperties = {
  position: 'relative',
  height: '420px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid #ddd',
  backgroundColor: '#e9edf0',
  // 지도 느낌을 주는 옅은 그리드 배경
  backgroundImage:
    'linear-gradient(rgba(0, 0, 0, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.045) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function RoomLocation({ room }: { room: RoomDetail }) {
  return (
    <section style={{ paddingBottom: '32px', borderBottom: '1px solid #ddd', marginBottom: '32px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>숙소 위치</h2>
      <p style={{ fontSize: '16px', color: '#222', margin: '0 0 24px' }}>{room.address}</p>

      <div
        style={mapBoxStyle}
        role="img"
        aria-label={`${room.address} 위치 지도 (준비 중)`}
        data-lat={room.latitude}
        data-lng={room.longitude}
      >
        {/* 중앙 마커 */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '56px', height: '56px', margin: '0 auto 14px' }}>
            <span
              className="map-ping"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'rgba(232, 76, 96, 0.35)',
              }}
            />
            <div
              style={{
                position: 'relative',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <MapPin size={28} color="#e84c60" />
            </div>
          </div>
          <span
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#fff',
              borderRadius: '999px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              fontSize: '14px',
              fontWeight: 600,
              color: '#222',
            }}
          >
            {room.region || room.address}
          </span>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: '#717171', margin: '12px 0 0' }}>
        지도는 준비 중입니다. 정확한 위치는 예약 확정 후 안내됩니다.
      </p>
    </section>
  );
}
