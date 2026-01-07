'use client';

import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl', // Increased width significantly as requested
};

/**
 * Wiederverwendbare Dialog/Modal-Komponente
 * 
 * @example
 * ```tsx
 * <Dialog
 *   isOpen={isDialogOpen}
 *   onClose={() => setIsDialogOpen(false)}
 *   title="Neue Anfrage"
 *   description="Füllen Sie alle Pflichtfelder aus."
 * >
 *   <form>...</form>
 * </Dialog>
 * ```
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md'
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div
            className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all flex flex-col my-8`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-14 pt-10 pb-8 border-b border-gray-100 shrink-0 rounded-t-2xl">
              <div className="pr-8">
                <h2 id="dialog-title" className="text-2xl font-bold text-gray-900 leading-tight">
                  {title}
                </h2>
                {description && (
                  <p className="mt-2 text-base text-gray-500">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 rounded-full hover:bg-gray-100"
                aria-label="Schließen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="w-full px-14">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

interface DialogFooterProps {
  children: ReactNode;
}

/**
 * Footer-Komponente für Dialog mit standardmäßiger Ausrichtung
 */
export function DialogFooter({ children }: DialogFooterProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4 pt-10 border-t border-gray-100 px-14 py-10 bg-gray-50 rounded-b-2xl">
      {children}
    </div>
  );
}

export default Dialog;
