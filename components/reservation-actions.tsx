'use client';

import { useTransition } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { updateReservationStatus } from '@/app/actions/reservations';

interface ReservationActionsProps {
  reservationId: number;
}

/**
 * "Pending" -> "Confirmed" / "Rejected" geçişlerini yöneten istemci bileşeni.
 * Server Action'dan gelen yanıt zarfına göre toast tetiklenir.
 */
export function ReservationActions({ reservationId }: ReservationActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (next: 'Confirmed' | 'Rejected') => {
    startTransition(async () => {
      const result = await updateReservationStatus(reservationId, next);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => handleAction('Confirmed')}
        className="h-8 gap-1.5 border-emerald-200 bg-emerald-50 px-3 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Onayla
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => handleAction('Rejected')}
        className="h-8 gap-1.5 border-red-200 bg-red-50 px-3 text-red-700 hover:bg-red-100 hover:text-red-800"
      >
        <X className="h-3.5 w-3.5" />
        Reddet
      </Button>
    </div>
  );
}
