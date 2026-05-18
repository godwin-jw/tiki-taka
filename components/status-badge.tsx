import { CheckCircle2, Clock, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ReservationStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ReservationStatus | string | null | undefined;
}

/**
 * Rezervasyon durumlarını görsel olarak ifade eden rozet.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const value = (status ?? 'Pending') as ReservationStatus;

  const config: Record<
    ReservationStatus,
    { label: string; cls: string; Icon: typeof Clock }
  > = {
    Pending: {
      label: 'Beklemede',
      cls: 'bg-amber-50 text-amber-700 ring-amber-200',
      Icon: Clock,
    },
    Confirmed: {
      label: 'Onaylandı',
      cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      Icon: CheckCircle2,
    },
    Rejected: {
      label: 'Reddedildi',
      cls: 'bg-red-50 text-red-700 ring-red-200',
      Icon: XCircle,
    },
  };

  const item = config[value] ?? config.Pending;
  const Icon = item.Icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        item.cls
      )}
    >
      <Icon className="h-3 w-3" />
      {item.label}
    </span>
  );
}
