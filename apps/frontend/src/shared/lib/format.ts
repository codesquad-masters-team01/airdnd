export function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}

// 클러스터 가격 범위용 짧은 표기 (예: 83000 → ₩83K)
export function formatCurrencyShort(value: number) {
  if (value >= 1000) {
    return `₩${Math.round(value / 1000)}K`;
  }
  return `₩${value}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

// 체크인–체크아웃을 한 줄로 압축 표기 (예: 2026년 7월 4일 – 6일)
export function formatStayRange(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const startText = `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일`;
  if (start.getFullYear() !== end.getFullYear()) {
    return `${startText} – ${end.getFullYear()}년 ${end.getMonth() + 1}월 ${end.getDate()}일`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${startText} – ${end.getMonth() + 1}월 ${end.getDate()}일`;
  }
  return `${startText} – ${end.getDate()}일`;
}
