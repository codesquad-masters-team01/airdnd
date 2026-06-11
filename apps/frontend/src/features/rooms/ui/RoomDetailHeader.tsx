import { Share } from 'lucide-react';
import { RoomDetail } from '../model/roomTypes';
import { AddToWishlistButton } from '../../wishlist/ui/AddToWishlistButton';

export function RoomDetailHeader({ room }: { room: RoomDetail }) {
  return (
    <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingTop: '12px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 500, color: '#222', margin: 0 }}>{room.name}</h1>
      <div style={{ display: 'flex', gap: '8px', fontSize: '14px', fontWeight: 400 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '8px', borderRadius: '8px' }}>
          <Share size={16} /> 공유하기
        </button>
        <AddToWishlistButton roomId={room.id} variant="text" />
      </div>
    </section>
  );
}
