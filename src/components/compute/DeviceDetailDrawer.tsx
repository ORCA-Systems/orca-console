// Device detail drawer — Orca Console
// Opens when a reviewer selects an accelerator from the Compute page.
// All values are simulated; no real hardware is probed.

import { useEffect, useRef, useCallback, type ReactNode } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface DeviceDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function DeviceDetailDrawer({
  open,
  onClose,
  title,
  children,
}: DeviceDetailDrawerProps) {
  const prevFocus = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  // Trap focus inside the drawer while open and restore focus on close.
  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.addEventListener('keydown', handleKeyDown);
      const focusable =
        closeBtnRef.current ??
        Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))[0];
      focusable?.focus({ preventScroll: true });
    }
    return () => {
      if (dialog) dialog.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (open) return;
    prevFocus.current?.focus({ preventScroll: true });
    prevFocus.current = null;
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="compute__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="compute__drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="compute__drawer-header">
          <h2 className="compute__drawer-title">{title}</h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="btn btn--ghost btn--sm compute__drawer-close"
            onClick={onClose}
            aria-label="Close detail"
          >
            ×
          </button>
        </div>
        <div className="compute__drawer-content">{children}</div>
      </div>
    </>
  );
}
