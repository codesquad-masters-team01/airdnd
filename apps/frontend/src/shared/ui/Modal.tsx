import { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 모달 카드의 최대 너비 (기본 440px) */
  maxWidth?: number;
  /** 우측 상단 닫기(X) 버튼 노출 여부 (기본 true) */
  showCloseButton?: boolean;
  /** 접근성 라벨 */
  ariaLabel?: string;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  animation: 'modal-overlay-in 160ms ease-out',
};

export function Modal({
  open,
  onClose,
  children,
  maxWidth = 440,
  showCloseButton = true,
  ariaLabel,
}: ModalProps) {
  // 열려 있는 동안 ESC 키로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const cardStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: `${maxWidth}px`,
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 24px 70px rgba(24, 24, 27, 0.2)',
    padding: '32px',
    animation: 'modal-card-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        style={cardStyle}
        onClick={(event) => event.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#222',
            }}
          >
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
