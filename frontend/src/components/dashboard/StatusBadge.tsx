'use client';

import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

type BadgeStatus = 'Aktiv' | 'Neu' | 'Wartend' | 'Abgeschlossen' | 'Bearbeitet';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  onClick?: () => void;
}

const statusStyles: Record<string, string> = {
  Aktiv: 'bg-blue-50 text-blue-700 border-blue-100',
  Neu: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Wartend: 'bg-amber-50 text-amber-700 border-amber-100',
  Abgeschlossen: 'bg-slate-50 text-slate-600 border-slate-100',
  Bearbeitet: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const statusIcons: Record<string, React.ReactNode> = {
  Aktiv: <Clock size={12} className="mr-1.5" />,
  Neu: <AlertCircle size={12} className="mr-1.5" />,
  Wartend: <Clock size={12} className="mr-1.5" />,
  Abgeschlossen: <CheckCircle2 size={12} className="mr-1.5" />,
  Bearbeitet: <CheckCircle2 size={12} className="mr-1.5" />,
};

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.Abgeschlossen;
  const icon = statusIcons[status];

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${style} ${
        onClick ? 'hover:brightness-95 cursor-pointer' : ''
      }`}
    >
      {icon}
      {status}
    </Component>
  );
}

type Priority = 'Hoch' | 'Mittel' | 'Niedrig';

interface PriorityDotProps {
  priority: Priority | string;
}

const priorityColors: Record<string, string> = {
  Hoch: 'bg-rose-500',
  Mittel: 'bg-orange-400',
  Niedrig: 'bg-slate-400',
};

export function PriorityDot({ priority }: PriorityDotProps) {
  const color = priorityColors[priority] || priorityColors.Niedrig;

  return (
    <div className="flex items-center space-x-2">
      <div className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-sm text-slate-600">{priority}</span>
    </div>
  );
}
