import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCurrentUserQuery } from '../../auth/api/authQueries';
import { RoomDetail } from '../../rooms/model/roomTypes';
import { getStayNights } from '../../../shared/lib/date';
import { formatCurrency, formatDate } from '../../../shared/lib/format';
import {
  eachNightValue,
  formatDateSummary,
  getMonthStart,
  parseDateValue,
  toDateValue,
} from '../../../shared/lib/calendar';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { Modal } from '../../../shared/ui/Modal';
import { CalendarPopover } from '../../../shared/ui/CalendarPopover';
import {
  CreateReservationFormValues,
  CreateReservationInput,
  createReservationSchema,
} from '../model/reservationTypes';
import {
  useCreateReservationMutation,
  useRoomBookedDatesQuery,
} from '../api/reservationsQueries';
import { GuestSelector } from './GuestSelector';

export function ReservationForm({ room }: { room: RoomDetail }) {
  const location = useLocation();
  const { data: user } = useCurrentUserQuery();
  const createMutation = useCreateReservationMutation(room.id);
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateReservationFormValues, unknown, CreateReservationInput>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      roomId: room.id,
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      infants: 0,
      pets: 0,
    },
  });

  const { data: bookedRanges } = useRoomBookedDatesQuery(room.id);

  const checkIn = useWatch({ control, name: 'checkIn' });
  const checkOut = useWatch({ control, name: 'checkOut' });
  const adults = useWatch({ control, name: 'adults' });
  const children = useWatch({ control, name: 'children' });
  const infants = useWatch({ control, name: 'infants' });
  const pets = useWatch({ control, name: 'pets' });
  const nights = getStayNights(checkIn, checkOut);
  const totalPrice = nights * room.pricePerNight;

  const guestSummary = buildGuestSummary(Number(adults), Number(children), Number(infants), Number(pets));
  // 모달 자식 JSX는 open=false여도 평가되므로, 날짜가 비어있으면 formatDate 호출을 피한다
  const scheduleText =
    checkIn && checkOut ? `${formatDate(checkIn)} → ${formatDate(checkOut)} · ${nights}박` : '';

  // 날짜 선택 달력 (메인 검색바와 동일한 CalendarPopover 재사용)
  const [openPanel, setOpenPanel] = useState<'checkIn' | 'checkOut' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    getMonthStart(parseDateValue(checkIn ?? '') ?? new Date()),
  );
  const dateFieldRef = useRef<HTMLDivElement>(null);
  const todayValue = toDateValue(new Date());

  // DB 예약 구간을 '점유된 밤'(YYYY-MM-DD) 집합으로 펼친다. 체크아웃 당일은 비어 있는 것으로 본다.
  const bookedNights = useMemo(() => {
    const nights = new Set<string>();
    (bookedRanges ?? []).forEach((range) => {
      eachNightValue(range.checkInDate, range.checkOutDate).forEach((night) => nights.add(night));
    });
    return nights;
  }, [bookedRanges]);

  // 체크인 이후 가장 이른 점유된 밤. 체크아웃이 이 날을 넘어 예약 구간을 가로지르지 못하게 막는다.
  const firstBlockedAfterCheckIn = useMemo(() => {
    if (!checkIn) return null;
    // YYYY-MM-DD 는 사전순 정렬이 곧 날짜순 정렬
    const after = [...bookedNights].filter((night) => night > checkIn).sort();
    return after[0] ?? null;
  }, [bookedNights, checkIn]);

  // 달력 바깥 클릭 / ESC 로 닫기
  useEffect(() => {
    if (!openPanel) return;

    function handlePointerDown(event: PointerEvent) {
      if (dateFieldRef.current && !dateFieldRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenPanel(null);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openPanel]);

  function selectDate(value: string) {
    if (openPanel === 'checkIn') {
      setValue('checkIn', value, { shouldValidate: true });
      // 체크인이 기존 체크아웃 이후면 체크아웃 초기화
      if (checkOut && value >= checkOut) {
        setValue('checkOut', '', { shouldValidate: true });
      }
      setOpenPanel('checkOut');
      return;
    }
    if (openPanel === 'checkOut') {
      if (checkIn && value <= checkIn) return;
      setValue('checkOut', value, { shouldValidate: true });
      setOpenPanel(null);
    }
  }

  function isDateSelected(value: string) {
    return value === checkIn || value === checkOut;
  }
  function isDateInRange(value: string) {
    return Boolean(checkIn && checkOut && value > checkIn && value < checkOut);
  }
  function isDateDisabled(value: string) {
    // 지난 날짜는 항상 비활성화
    if (value < todayValue) return true;

    if (openPanel === 'checkOut' && checkIn) {
      // 체크아웃: 체크인 당일 이전 불가 + 예약 구간을 가로지르는 날짜 불가.
      // (체크아웃 당일은 점유로 보지 않으므로 첫 점유된 밤 당일까지는 선택 가능 — 턴오버 허용)
      if (value <= checkIn) return true;
      return Boolean(firstBlockedAfterCheckIn && value > firstBlockedAfterCheckIn);
    }

    // 체크인(또는 체크인 미선택): 이미 예약된 밤은 선택 불가 → 지난 날짜처럼 회색 처리됨
    return bookedNights.has(value);
  }

  function onSubmit(input: CreateReservationInput) {
    if (!user) return;

    createMutation.mutate(
      {
        guestId: user.id,
        roomId: room.id,
        checkInDate: input.checkIn,
        checkOutDate: input.checkOut,
        totalPrice,
        adultCount: input.adults,
        childCount: input.children,
        infantCount: input.infants,
        hasPets: input.pets > 0,
      },
      {
        onSuccess: () => setShowSuccess(true),
      },
    );
  }

  if (!user) {
    return (
      <aside className="booking-card">
        <p className="booking-login-title">예약하기</p>
        <p className="booking-login-desc">예약하려면 로그인이 필요합니다.</p>
        <Link to="/login" state={{ from: location }} className="booking-submit as-link">
          로그인하고 예약하기
        </Link>
      </aside>
    );
  }

  return (
    <>
      <aside className="booking-card">
        <p className="booking-price-row">
          <span className="booking-price">{formatCurrency(room.pricePerNight)}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" value={room.id} {...register('roomId', { valueAsNumber: true })} />
          {/* RHF 검증·제출용 (값은 달력에서 setValue로 채움) */}
          <input type="hidden" {...register('checkIn')} />
          <input type="hidden" {...register('checkOut')} />

          {/* 체크인 / 체크아웃 — 하나의 테두리 박스 + 달력 팝오버 */}
          <div ref={dateFieldRef} className="booking-date-field">
            <div className="booking-date-grid">
              <button
                type="button"
                onClick={() => setOpenPanel(openPanel === 'checkIn' ? null : 'checkIn')}
                className={`booking-date-cell start${openPanel === 'checkIn' ? ' is-open' : ''}`}
              >
                <span className="booking-date-label">체크인</span>
                <span className={checkIn ? 'booking-date-value' : 'booking-date-placeholder'}>
                  {checkIn ? formatDateSummary(checkIn, '날짜 추가') : '날짜 추가'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setOpenPanel(openPanel === 'checkOut' ? null : 'checkOut')}
                className={`booking-date-cell${openPanel === 'checkOut' ? ' is-open' : ''}`}
              >
                <span className="booking-date-label">체크아웃</span>
                <span className={checkOut ? 'booking-date-value' : 'booking-date-placeholder'}>
                  {checkOut ? formatDateSummary(checkOut, '날짜 추가') : '날짜 추가'}
                </span>
              </button>
            </div>
            {openPanel ? (
              <CalendarPopover
                compact
                monthsToShow={1}
                activePanel={openPanel}
                month={calendarMonth}
                selectedCheckIn={parseDateValue(checkIn ?? '')}
                selectedCheckOut={parseDateValue(checkOut ?? '')}
                onMonthChange={setCalendarMonth}
                onSelectDate={selectDate}
                isDateDisabled={isDateDisabled}
                isDateInRange={isDateInRange}
                isDateSelected={isDateSelected}
              />
            ) : null}
          </div>
          {errors.checkIn ? <span className="booking-field-error">{errors.checkIn.message}</span> : null}
          {errors.checkOut ? <span className="booking-field-error">{errors.checkOut.message}</span> : null}

          <div className="booking-guests">
            <GuestSelector
              maxGuests={room.maxGuests}
              allowsPets={room.allowsPets}
              setValue={setValue}
              watch={watch}
            />
          </div>
          {errors.adults ? <span className="booking-field-error">{errors.adults.message}</span> : null}

          <button type="submit" disabled={createMutation.isPending} className="booking-submit spaced">
            {createMutation.isPending ? '예약 중...' : '예약 요청'}
          </button>

          <p className="booking-fineprint">예약 확정 전에는 요금이 청구되지 않습니다.</p>

          {/* 요금 상세 — 숙박 일수가 정해졌을 때만 노출 */}
          {nights > 0 && (
            <div className="booking-price-detail">
              <div className="booking-price-line">
                <span className="booking-price-line__label">
                  {formatCurrency(room.pricePerNight)} × {nights}박
                </span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="booking-price-total">
                <span>총 합계</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          )}

          {createMutation.error ? (
            <div className="booking-error">
              <ErrorMessage error={createMutation.error} />
            </div>
          ) : null}
        </form>
      </aside>

      {/* 예약 완료 팝업 */}
      <Modal open={showSuccess} onClose={() => setShowSuccess(false)} ariaLabel="예약 완료">
        <div className="booking-success">
          <div className="booking-success__check">
            <Check size={34} strokeWidth={3} color="#fff" />
          </div>
          <h2 className="booking-success__title">예약이 완료되었습니다!</h2>
          <p className="booking-success__desc">예약 내역은 ‘예약 목록’에서 확인할 수 있어요.</p>

          <div className="booking-success__summary">
            <SummaryRow label="숙소" value={room.name} />
            <SummaryRow label="일정" value={scheduleText} />
            <SummaryRow label="인원" value={guestSummary} />
            <SummaryRow label="총 금액" value={formatCurrency(totalPrice)} emphasize />
          </div>

          <Link to="/reservations" className="booking-submit as-link">
            예약 목록 보기
          </Link>
          <button type="button" onClick={() => setShowSuccess(false)} className="booking-success__dismiss">
            계속 둘러보기
          </button>
        </div>
      </Modal>
    </>
  );
}

function SummaryRow({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="booking-summary-row">
      <span className="booking-summary-row__label">{label}</span>
      <span className={`booking-summary-row__value${emphasize ? ' emphasize' : ''}`}>{value}</span>
    </div>
  );
}

function buildGuestSummary(adults: number, children: number, infants: number, pets: number) {
  const guests = (adults || 0) + (children || 0);
  let summary = `게스트 ${guests}명`;
  if (infants > 0) summary += `, 유아 ${infants}명`;
  if (pets > 0) summary += `, 반려동물 ${pets}마리`;
  return summary;
}
