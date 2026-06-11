import { RoomDetail } from '../model/roomTypes';

export function RoomDescription({ room }: { room: RoomDetail }) {
  return (
    <section style={{ paddingBottom: '32px', borderBottom: '1px solid #ddd', marginBottom: '32px' }}>
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#222', whiteSpace: 'pre-line' }}>{room.description}</p>
    </section>
  );
}
