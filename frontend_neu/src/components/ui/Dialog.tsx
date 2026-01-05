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
  '2xl': 'max-w-5xl',
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
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className={`relative bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} transform transition-all`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div>
                <h2 id="dialog-title" className="text-xl font-semibold text-gray-900">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors p-1 -m-1 rounded-lg hover:bg-gray-100"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
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
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 -mx-6 -mb-6 px-6 py-4 bg-gray-50 rounded-b-xl">
      {children}
    </div>
  );
}

export default Dialog;
