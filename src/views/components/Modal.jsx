import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal Dialog aligned with Blibli BLUE Design System
 * Adapts into a bottom sheet on mobile screens (<= 768px)
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true
}) => {
  const touchStartY = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = size === 'lg' ? 'modal-lg' : size === 'sm' ? 'modal-sm' : '';

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // Swipe down gesture to dismiss bottom sheet
    if (deltaY > 60) {
      onClose();
    }
  };

  return (
    <div
      className="blue-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && closeOnBackdrop) {
          onClose();
        }
      }}
    >
      <div 
        className={`blue-modal ${sizeClass}`}
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="bottom-sheet-handle-wrapper"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-hidden="true"
        >
          <div className="bottom-sheet-handle-bar" />
        </div>

        <div className="blue-modal-header">
          <div>
            <h3 className="blue-modal-title">{title}</h3>
            {subtitle && <p className="text-xs text-secondary mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="btn-icon btn-ghost"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="blue-modal-body">
          {children}
        </div>

        {footer && (
          <div className="blue-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

