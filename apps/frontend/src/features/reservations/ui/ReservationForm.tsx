import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCurrentUserQuery } from '../../auth/api/authQueries';
import { RoomDetail } from '../../rooms/model/roomTypes';
import { getStayNights } from '../../../shared/lib/date';
import { formatCurrency, formatDate } from '../../../shared/lib/format';
import {
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
import { useCreateReservationMutation } from '../api/reservationsQueries';
import { GuestSelector } from './GuestSelector';

const cardStyle: CSSProperties = {
  border: '1px solid #dddddd',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
  backgroundColor: '#fff',
};

const dateCellStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  padding: '10px 12px',
  cursor: 'pointer',
};

const dateLabelStyle: CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: '#222',
  textTransform: 'uppercase',
};

const dateValueStyle: CSSProperties = {
  fontSize: '14px',
  color: '#222',
};

const datePlaceholderStyle: CSSProperties = {
  fontSize: '14px',
  color: '#717171',
};

const fieldErrorStyle: CSSProperties = {
  display: 'block',
  marginTop: '6px',
  color: '#c93449',
  fontSize: '13px',
};

const primaryButtonStyle: CSSProperties = {
  width: '100%',
  padding: '14px',
  border: 'none',
  borderRadius: '10px',
  background: 'linear-gradient(to right, #e84c60, #c93449)',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
};

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
    // 지난 날짜 + (체크아웃 선택 중일 때) 체크인 이전 날짜 비활성화
    if (value < todayValue) return true;
    return openPanel === 'checkOut' && Boolean(checkIn && value <= checkIn);
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
      <aside style={cardStyle}>
        <p style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>예약하기</p>
        <p style={{ color: '#717171', fontSize: '15px', margin: '0 0 20px' }}>
          예약하려면 로그인이 필요합니다.
        </p>
        <Link
          to="/login"
          state={{ from: location }}
          style={{ ...primaryButtonStyle, display: 'block', textAlign: 'center', textDecoration: 'none' }}
        >
          로그인하고 예약하기
        </Link>
      </aside>
    );
  }

  return (
    <>
      <aside style={cardStyle}>
        <p style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '22px', fontWeight: 600, color: '#222' }}>
            {formatCurrency(room.pricePerNight)}
          </span>
          <span style={{ fontSize: '16px', color: '#222' }}> / 박</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" value={room.id} {...register('roomId', { valueAsNumber: true })} />
          {/* RHF 검증·제출용 (값은 달력에서 setValue로 채움) */}
          <input type="hidden" {...register('checkIn')} />
          <input type="hidden" {...register('checkOut')} />

          {/* 체크인 / 체크아웃 — 하나의 테두리 박스 + 달력 팝오버 */}
          <div ref={dateFieldRef} style={{ position: 'relative', marginBottom: '8px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                border: '1px solid #b0b0b0',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenPanel(openPanel === 'checkIn' ? null : 'checkIn')}
                style={{
                  ...dateCellStyle,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  borderRight: '1px solid #b0b0b0',
                  background: openPanel === 'checkIn' ? '#f7f7f7' : '#fff',
                }}
              >
                <span style={dateLabelStyle}>체크인</span>
                <span style={checkIn ? dateValueStyle : datePlaceholderStyle}>
                  {checkIn ? formatDateSummary(checkIn, '날짜 추가') : '날짜 추가'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setOpenPanel(openPanel === 'checkOut' ? null : 'checkOut')}
                style={{
                  ...dateCellStyle,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  background: openPanel === 'checkOut' ? '#f7f7f7' : '#fff',
                }}
              >
                <span style={dateLabelStyle}>체크아웃</span>
                <span style={checkOut ? dateValueStyle : datePlaceholderStyle}>
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
          {errors.checkIn ? <span style={fieldErrorStyle}>{errors.checkIn.message}</span> : null}
          {errors.checkOut ? <span style={fieldErrorStyle}>{errors.checkOut.message}</span> : null}

          <div style={{ marginTop: '8px' }}>
            <GuestSelector
              maxGuests={room.maxGuests}
              allowsPets={room.allowsPets}
              setValue={setValue}
              watch={watch}
            />
          </div>
          {errors.adults ? <span style={fieldErrorStyle}>{errors.adults.message}</span> : null}

          <button
            type="submit"
            disabled={createMutation.isPending}
            style={{
              ...primaryButtonStyle,
              marginTop: '16px',
              opacity: createMutation.isPending ? 0.7 : 1,
              cursor: createMutation.isPending ? 'default' : 'pointer',
            }}
          >
            {createMutation.isPending ? '예약 중...' : '예약 요청'}
          </button>

          <p style={{ textAlign: 'center', color: '#717171', fontSize: '13px', margin: '12px 0 0' }}>
            예약 확정 전에는 요금이 청구되지 않습니다.
          </p>

          {/* 요금 상세 — 숙박 일수가 정해졌을 때만 노출 */}
          {nights > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#222',
                  fontSize: '15px',
                  marginBottom: '12px',
                }}
              >
                <span style={{ textDecoration: 'underline' }}>
                  {formatCurrency(room.pricePerNight)} × {nights}박
                </span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #ddd',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#222',
                }}
              >
                <span>총 합계</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          )}

          {createMutation.error ? (
            <div style={{ marginTop: '16px' }}>
              <ErrorMessage error={createMutation.error} />
            </div>
          ) : null}
        </form>
      </aside>

      {/* 예약 완료 팝업 */}
      <Modal open={showSuccess} onClose={() => setShowSuccess(false)} ariaLabel="예약 완료">
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'linear-gradient(to right, #e84c60, #c93449)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={34} strokeWidth={3} color="#fff" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px', color: '#222' }}>
            예약이 완료되었습니다!
          </h2>
          <p style={{ color: '#717171', fontSize: '15px', margin: '0 0 24px' }}>
            예약 내역은 ‘예약 목록’에서 확인할 수 있어요.
          </p>

          <div
            style={{
              textAlign: 'left',
              border: '1px solid #eee',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <SummaryRow label="숙소" value={room.name} />
            <SummaryRow label="일정" value={scheduleText} />
            <SummaryRow label="인원" value={guestSummary} />
            <SummaryRow label="총 금액" value={formatCurrency(totalPrice)} emphasize />
          </div>

          <Link
            to="/reservations"
            style={{ ...primaryButtonStyle, display: 'block', textAlign: 'center', textDecoration: 'none' }}
          >
            예약 목록 보기
          </Link>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '12px',
              border: 'none',
              background: 'transparent',
              color: '#222',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            계속 둘러보기
          </button>
        </div>
      </Modal>
    </>
  );
}

function SummaryRow({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        padding: '8px 0',
      }}
    >
      <span style={{ color: '#717171', fontSize: '14px', flexShrink: 0 }}>{label}</span>
      <span
        style={{
          color: '#222',
          fontSize: emphasize ? '16px' : '14px',
          fontWeight: emphasize ? 700 : 500,
          textAlign: 'right',
        }}
      >
        {value}
      </span>
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
