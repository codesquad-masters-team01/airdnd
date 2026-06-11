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
