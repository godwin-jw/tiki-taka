'use server';

import { revalidatePath } from 'next/cache';

import { supabase } from '@/lib/supabase';
import type { ActionResponse, ReservationStatus } from '@/lib/types';

/**
 * Bir rezervasyonun durumunu (Confirmed / Rejected) günceller.
 */
export async function updateReservationStatus(
  id: number,
  status: ReservationStatus
): Promise<ActionResponse> {
  if (!id || !['Confirmed', 'Rejected'].includes(status)) {
    return { success: false, message: 'Geçersiz parametre.' };
  }

  const { error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Rezervasyon güncellenirken hata:', error);
    return {
      success: false,
      message: 'Rezervasyon güncellenemedi. Lütfen tekrar deneyin.',
    };
  }

  revalidatePath('/');

  return {
    success: true,
    message:
      status === 'Confirmed'
        ? 'Rezervasyon onaylandı.'
        : 'Rezervasyon reddedildi.',
  };
}
