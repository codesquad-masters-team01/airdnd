import { FormEvent, PointerEvent, useState } from 'react';
import { Minus, PawPrint, Plus, Search } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/format';
import { RoomSearchParams } from '../model/roomTypes';

type SearchBarProps = {
  defaultValue: RoomSearchParams;
  onSearch: (params: RoomSearchParams) => void;
};

type OccupancyKey = 'adults' | 'children' | 'infants';
type OccupancyRule = {
  title: string;
  description: string;
  min: number;
  max?: number;
};

const PRICE_MIN = 0;
const PRICE_MAX = 500000;
const PRICE_STEP = 10000;
const PRICE_BUCKETS = [28, 46, 64, 88, 76, 58, 44, 31, 20, 14];

const occupancyLabels: Record<OccupancyKey, OccupancyRule> = {
  adults: { title: '성인', description: '만 13세 이상, 최대 8명', min: 1, max: 8 },
  children: { title: '아동', description: '만 2-12세, 최대 8명', min: 0, max: 8 },
  infants: { title: '유아', description: '만 2세 미만, 최대 8명', min: 0, max: 8 },
};

function clampOccupancyValue(key: OccupancyKey, value: number) {
  const rule = occupancyLabels[key];
  return Math.min(rule.max ?? Number.POSITIVE_INFINITY, Math.max(rule.min, value));
}

export function SearchBar({ defaultValue, onSearch }: SearchBarProps) {
  const [region, setRegion] = useState(defaultValue.region ?? '');
  const [checkIn, setCheckIn] = useState(defaultValue.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(defaultValue.checkOut ?? '');
  const [adults, setAdults] = useState(
    clampOccupancyValue('adults', defaultValue.adults ?? defaultValue.guests ?? 1),
  );
  const [children, setChildren] = useState(clampOccupancyValue('children', defaultValue.children ?? 0));
  const [infants, setInfants] = useState(clampOccupancyValue('infants', defaultValue.infants ?? 0));
  const [minPrice, setMinPrice] = useState(defaultValue.minPrice ?? PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(defaultValue.maxPrice ?? PRICE_MAX);
  const [allowsPets, setAllowsPets] = useState(defaultValue.allowsPets ?? false);
  const [openPanel, setOpenPanel] = useState<'price' | 'occupancy' | null>(null);

  const stayGuests = adults + children;
  const hasPriceFilter = minPrice > PRICE_MIN || maxPrice < PRICE_MAX;
  const occupancySummary = [
    `${stayGuests}명`,
    infants > 0 ? `유아 ${infants}명` : null,
    allowsPets ? '반려동물' : null,
  ]
    .filter(Boolean)
    .join(', ');
  const priceSummary = hasPriceFilter
    ? `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
    : '가격 범위';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch({
      region,
      checkIn,
      checkOut,
      adults,
      children,
      infants,
      guests: stayGuests,
      minPrice: hasPriceFilter ? minPrice : undefined,
      maxPrice: hasPriceFilter ? maxPrice : undefined,
      allowsPets: allowsPets || undefined,
    });
    setOpenPanel(null);
  }

  function updateOccupancy(key: OccupancyKey, direction: 1 | -1) {
    const setters = {
      adults: setAdults,
      children: setChildren,
      infants: setInfants,
    };
    const values = {
      adults,
      children,
      infants,
    };
    const nextValue = clampOccupancyValue(key, values[key] + direction);
    setters[key](nextValue);
  }

  function updateMinPrice(nextValue: number) {
    setMinPrice(Math.min(nextValue, maxPrice - PRICE_STEP));
  }

  function updateMaxPrice(nextValue: number) {
    setMaxPrice(Math.max(nextValue, minPrice + PRICE_STEP));
  }

  function updatePriceInput(key: 'min' | 'max', value: string) {
    const parsedValue = Number(value);
    const boundedValue = Math.min(Math.max(parsedValue, PRICE_MIN), PRICE_MAX);

    if (key === 'min') {
      updateMinPrice(boundedValue);
      return;
    }

    updateMaxPrice(boundedValue);
  }

  function resetPrice() {
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);
  }

  function handlePriceTrackPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLInputElement) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const rawValue = ((event.clientX - rect.left) / rect.width) * PRICE_MAX;
    const nextValue = Math.round(rawValue / PRICE_STEP) * PRICE_STEP;
    const boundedValue = Math.min(Math.max(nextValue, PRICE_MIN), PRICE_MAX);
    const distanceToMin = Math.abs(boundedValue - minPrice);
    const distanceToMax = Math.abs(boundedValue - maxPrice);

    if (distanceToMin <= distanceToMax) {
      updateMinPrice(boundedValue);
      return;
    }

    updateMaxPrice(boundedValue);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <label className="search-field">
        지역
        <input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="서울" />
      </label>
      <label className="search-field">
        체크인
        <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
      </label>
      <label className="search-field">
        체크아웃
        <input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
      </label>
      <div className="search-field dropdown-field">
        <span>가격</span>
        <button
          className="search-select"
          type="button"
          aria-expanded={openPanel === 'price'}
          onClick={() => setOpenPanel(openPanel === 'price' ? null : 'price')}
        >
          {priceSummary}
        </button>
        {openPanel === 'price' ? (
          <div className="search-popover price-popover">
            <div className="price-popover-header">
              <strong>1박 요금 범위</strong>
              <span>{priceSummary}</span>
            </div>
            <div className="price-histogram" aria-hidden="true">
              {PRICE_BUCKETS.map((height, index) => {
                const bucketSize = PRICE_MAX / PRICE_BUCKETS.length;
                const bucketMin = index * bucketSize;
                const bucketMax = bucketMin + bucketSize;
                const isActive = bucketMax >= minPrice && bucketMin <= maxPrice;

                return (
                  <span
                    className={isActive ? 'active' : ''}
                    key={`${height}-${index}`}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
            <div className="range-slider" aria-label="가격 범위" onPointerDown={handlePriceTrackPointerDown}>
              <div
                className="range-track-active"
                style={{
                  left: `${(minPrice / PRICE_MAX) * 100}%`,
                  right: `${100 - (maxPrice / PRICE_MAX) * 100}%`,
                }}
              />
              <input
                aria-label="최소 가격"
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={minPrice}
                onChange={(event) => updateMinPrice(Number(event.target.value))}
              />
              <input
                aria-label="최대 가격"
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={maxPrice}
                onChange={(event) => updateMaxPrice(Number(event.target.value))}
              />
            </div>
            <div className="price-input-grid">
              <label>
                최소 가격
                <input
                  type="number"
                  min={PRICE_MIN}
                  max={PRICE_MAX - PRICE_STEP}
                  step={PRICE_STEP}
                  value={minPrice}
                  onChange={(event) => updatePriceInput('min', event.target.value)}
                />
              </label>
              <label>
                최대 가격
                <input
                  type="number"
                  min={PRICE_MIN + PRICE_STEP}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={maxPrice}
                  onChange={(event) => updatePriceInput('max', event.target.value)}
                />
              </label>
            </div>
            <button className="ghost-button" type="button" onClick={resetPrice}>
              가격 초기화
            </button>
          </div>
        ) : null}
      </div>
      <div className="search-field dropdown-field">
        <span>인원</span>
        <button
          className="search-select"
          type="button"
          aria-expanded={openPanel === 'occupancy'}
          onClick={() => setOpenPanel(openPanel === 'occupancy' ? null : 'occupancy')}
        >
          {occupancySummary}
        </button>
        {openPanel === 'occupancy' ? (
          <div className="search-popover occupancy-popover">
            {(['adults', 'children', 'infants'] as OccupancyKey[]).map((key) => (
              <div className="occupancy-row" key={key}>
                <div>
                  <strong>{occupancyLabels[key].title}</strong>
                  <p className="muted">{occupancyLabels[key].description}</p>
                </div>
                <div className="stepper">
                  <button
                    type="button"
                    className="stepper-button"
                    aria-label={`${occupancyLabels[key].title} 감소`}
                    onClick={() => updateOccupancy(key, -1)}
                    disabled={{ adults, children, infants }[key] <= occupancyLabels[key].min}
                  >
                    <Minus size={14} />
                  </button>
                  <span>{{ adults, children, infants }[key]}</span>
                  <button
                    type="button"
                    className="stepper-button"
                    aria-label={`${occupancyLabels[key].title} 증가`}
                    onClick={() => updateOccupancy(key, 1)}
                    disabled={
                      occupancyLabels[key].max !== undefined &&
                      { adults, children, infants }[key] >= occupancyLabels[key].max
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
            <label className="checkbox-row occupancy-filter-row">
              <input
                type="checkbox"
                checked={allowsPets}
                onChange={(event) => setAllowsPets(event.target.checked)}
              />
              <span>
                <strong>반려동물 동반 가능</strong>
                <small>반려동물 허용 숙소만 검색합니다.</small>
              </span>
              <PawPrint size={18} />
            </label>
          </div>
        ) : null}
      </div>
      <button className="primary-button search-button" type="submit">
        <Search size={18} />
        검색
      </button>
    </form>
  );
}
