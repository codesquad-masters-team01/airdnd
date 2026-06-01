import { FormEvent, useState } from 'react';
import { RoomSearchParams } from '../model/roomTypes';

type SearchBarProps = {
  defaultValue: RoomSearchParams;
  onSearch: (params: RoomSearchParams) => void;
};

export function SearchBar({ defaultValue, onSearch }: SearchBarProps) {
  const [region, setRegion] = useState(defaultValue.region ?? '');
  const [checkIn, setCheckIn] = useState(defaultValue.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(defaultValue.checkOut ?? '');
  const [guests, setGuests] = useState(defaultValue.guests ?? 1);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch({
      region,
      checkIn,
      checkOut,
      guests,
    });
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <label>
        지역
        <input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="서울" />
      </label>
      <label>
        체크인
        <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
      </label>
      <label>
        체크아웃
        <input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
      </label>
      <label>
        인원
        <input
          type="number"
          min={1}
          value={guests}
          onChange={(event) => setGuests(Number(event.target.value))}
        />
      </label>
      <button className="primary-button" type="submit">
        검색
      </button>
    </form>
  );
}
