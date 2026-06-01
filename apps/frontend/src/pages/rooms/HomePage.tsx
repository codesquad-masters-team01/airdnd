import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../../features/rooms/ui/SearchBar';
import { RoomList } from '../../features/rooms/ui/RoomList';
import { useRoomsQuery } from '../../features/rooms/api/roomsQueries';
import { RoomSearchParams } from '../../features/rooms/model/roomTypes';
import { Loading } from '../../shared/ui/Loading';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params: RoomSearchParams = {
    region: searchParams.get('region') ?? '',
    checkIn: searchParams.get('checkIn') ?? '',
    checkOut: searchParams.get('checkOut') ?? '',
    guests: Number(searchParams.get('guests') ?? '1'),
  };
  const roomsQuery = useRoomsQuery(params);

  function handleSearch(nextParams: RoomSearchParams) {
    const next = new URLSearchParams();
    Object.entries(nextParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  }

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">AirDnD</p>
        <h1>원하는 숙소를 검색하고 예약하세요.</h1>
        <p className="muted">현재 화면은 MSW mock API를 통해 백엔드 없이 동작합니다.</p>
      </div>
      <SearchBar defaultValue={params} onSearch={handleSearch} />
      {roomsQuery.isLoading ? <Loading message="숙소 목록을 불러오는 중입니다." /> : null}
      {roomsQuery.error ? <ErrorMessage error={roomsQuery.error} /> : null}
      {roomsQuery.data ? <RoomList rooms={roomsQuery.data} /> : null}
    </section>
  );
}
