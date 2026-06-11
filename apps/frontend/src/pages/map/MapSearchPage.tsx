import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRoomsQuery } from '../../features/rooms/api/roomsQueries';
import { SearchBar } from '../../features/rooms/ui/SearchBar';
import { RoomReviewBadge } from '../../features/reviews/ui/RoomReviewBadge';
import { RoomResultsMap } from '../../features/maps/ui/RoomResultsMap';
import { RoomSearchParams } from '../../features/rooms/model/roomTypes';
import { formatCurrency } from '../../shared/lib/format';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { Loading } from '../../shared/ui/Loading';

export function MapSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());
  const [visibleRoomIds, setVisibleRoomIds] = useState<Set<number> | null>(null);

  const params: RoomSearchParams = {
    region: searchParams.get('region') ?? '',
    checkIn: searchParams.get('checkIn') ?? '',
    checkOut: searchParams.get('checkOut') ?? '',
    guests: Number(searchParams.get('guests') ?? '1'),
    adults: Number(searchParams.get('adults') ?? searchParams.get('guests') ?? '1'),
    children: Number(searchParams.get('children') ?? '0'),
    infants: Number(searchParams.get('infants') ?? '0'),
    minPrice: Number(searchParams.get('minPrice') ?? '0') || undefined,
    maxPrice: Number(searchParams.get('maxPrice') ?? '0') || undefined,
    allowsPets: searchParams.get('allowsPets') === 'true' || undefined,
  };
  const roomsQuery = useRoomsQuery(params);

  function handleSearch(nextParams: RoomSearchParams) {
    setVisibleRoomIds(null);
    const next = new URLSearchParams();
    Object.entries(nextParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  }

  function handleSelect(roomId: number | null) {
    setSelectedId(roomId);
    if (roomId != null) {
      // 한 번 열어 본 숙소는 마커가 흐려집니다(viewed).
      setViewedIds((prev) => new Set(prev).add(roomId));
    }
  }

  const visibleRooms = roomsQuery.data?.filter((room) => visibleRoomIds == null || visibleRoomIds.has(room.id));

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Map Search</p>
        <h1>지도에서 숙소 찾기</h1>
        <p className="muted">검색 결과를 지도에서 함께 확인하세요.</p>
      </div>
      <SearchBar defaultValue={params} onSearch={handleSearch} />
      {roomsQuery.isLoading ? <Loading message="지도 검색 결과를 불러오는 중입니다." /> : null}
      {roomsQuery.error ? <ErrorMessage error={roomsQuery.error} /> : null}
      {roomsQuery.data ? (
        <div className="map-layout">
          <div className="list-stack">
            {visibleRooms?.map((room) => (
              <Link
                className={`map-result-card ${
                  selectedId === room.id || hoveredId === room.id ? 'is-active' : ''
                }`}
                to={`/rooms/${room.id}`}
                key={room.id}
                onMouseEnter={() => setHoveredId(room.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <img src={room.imageUrl} alt={`${room.name} 대표 이미지`} />
                <div>
                  <h2>{room.name}</h2>
                  <p className="muted">{room.address}</p>
                  <p className="card-meta">
                    <RoomReviewBadge roomId={room.id} showReviewCount={false} /> ·{' '}
                    {formatCurrency(room.pricePerNight)} / 박
                  </p>
                </div>
              </Link>
            ))}
            {visibleRooms?.length === 0 ? (
              <p className="map-results-empty">현재 지도 영역에 검색 결과가 없습니다.</p>
            ) : null}
          </div>
          <RoomResultsMap
            rooms={roomsQuery.data}
            selectedId={selectedId}
            hoveredId={hoveredId}
            viewedIds={viewedIds}
            onSelect={handleSelect}
            onHover={setHoveredId}
            onVisibleRoomsChange={setVisibleRoomIds}
          />
        </div>
      ) : null}
    </section>
  );
}
