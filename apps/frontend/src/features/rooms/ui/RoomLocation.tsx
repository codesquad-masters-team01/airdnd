import { RoomDetail } from '../model/roomTypes';
import { RoomLocationMap } from '../../maps/ui/RoomLocationMap';

export function RoomLocation({ room }: { room: RoomDetail }) {
  return (
    <section style={{ paddingBottom: '32px', borderBottom: '1px solid #ddd', marginBottom: '32px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>숙소 위치</h2>
      <p style={{ fontSize: '16px', color: '#222', margin: '0 0 24px' }}>{room.address}</p>

      <RoomLocationMap latitude={room.latitude} longitude={room.longitude} name={room.name} />
    </section>
  );
}
