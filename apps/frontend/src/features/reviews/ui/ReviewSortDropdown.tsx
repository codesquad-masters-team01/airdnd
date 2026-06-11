import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export type ReviewSortKey = 'latest' | 'highest' | 'lowest';

export const REVIEW_SORT_OPTIONS: { key: ReviewSortKey; label: string }[] = [
  { key: 'latest', label: '최신순' },
  { key: 'highest', label: '평점 높은 순' },
  { key: 'lowest', label: '평점 낮은 순' },
];

interface ReviewSortDropdownProps {
  value: ReviewSortKey;
  onChange: (value: ReviewSortKey) => void;
}

const triggerStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  background: '#fff',
  border: '1px solid #222',
  borderRadius: '24px',
  color: '#222',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const menuStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  zIndex: 10,
  minWidth: '200px',
  padding: '8px',
  background: '#fff',
  border: '1px solid #ebebeb',
  borderRadius: '12px',
  boxShadow: '0 12px 40px rgba(24, 24, 27, 0.18)',
};

const itemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '10px 12px',
  background: 'none',
  border: 'none',
  borderRadius: '8px',
  color: '#222',
  fontSize: '14px',
  textAlign: 'left',
  cursor: 'pointer',
};

export function ReviewSortDropdown({ value, onChange }: ReviewSortDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 / ESC 로 닫기
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const currentLabel =
    REVIEW_SORT_OPTIONS.find((option) => option.key === value)?.label ?? '최신순';

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={triggerStyle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currentLabel}
        <ChevronDown
          size={16}
          style={{ transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div role="listbox" style={menuStyle}>
          {REVIEW_SORT_OPTIONS.map((option) => {
            const isSelected = option.key === value;
            return (
              <button
                key={option.key}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
                style={{ ...itemStyle, fontWeight: isSelected ? 700 : 400 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f7f7')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                {option.label}
                {isSelected && <Check size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
