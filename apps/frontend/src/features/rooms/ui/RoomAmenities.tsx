import { RoomDetail } from '../model/roomTypes';

export function RoomAmenities({ room }: { room: RoomDetail }) {
  return (
    <section style={{ paddingBottom: '32px', borderBottom: '1px solid #ddd', marginBottom: '32px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>숙소 편의시설</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {room.amenities.map((amenity) => (
          <div key={amenity} style={{ fontSize: '16px', color: '#222', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {amenity}
          </div>
        ))}
      </div>
    </section>
  );
}
