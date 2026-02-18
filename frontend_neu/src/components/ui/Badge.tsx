'use client';

import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantClasses = {
  default: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-cyan-100 text-cyan-800',
};

/**
 * Badge-Komponente für Status und andere Kategorien
 * @example
 * ```tsx
 * <Badge variant="success">Offen</Badge>
 * <Badge variant="warning">Ausstehend</Badge>
 * <Badge variant="danger">Geschlossen</Badge>
 * ```
 */
export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
