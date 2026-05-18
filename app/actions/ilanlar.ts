'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { supabase } from '@/lib/supabase';
import type { ActionResponse } from '@/lib/types';

/**
 * Adam eksik ilanını siler.
 * Sadece kendi sahalarındaki ilanlara izin verilir.
 */
export async function deleteIlanAction(id: number): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const ownerEmail = cookieStore.get('owner_email')?.value;

  if (!ownerEmail) {
    return { success: false, message: 'Oturum bulunamadı.' };
  }

  if (!id) {
    return { success: false, message: 'Geçersiz ilan kimliği.' };
  }

  // Bu işletmeciye ait saha isimlerini bul
  const { data: ownedFields, error: fieldsError } = await supabase
    .from('fields')
    .select('name')
    .eq('owner_email', ownerEmail);

  if (fieldsError) {
    console.error('Sahalar çekilirken hata:', fieldsError);
    return { success: false, message: 'Yetki doğrulanamadı.' };
  }

  const fieldNames = (ownedFields ?? []).map((f) => f.name);
  if (fieldNames.length === 0) {
    return { success: false, message: 'Bu işlemi yapma yetkiniz yok.' };
  }

  const { error } = await supabase
    .from('missing_players')
    .delete()
    .eq('id', id)
    .in('field_name', fieldNames);

  if (error) {
    console.error('İlan silinirken hata:', error);
    return { success: false, message: 'İlan silinemedi.' };
  }

  revalidatePath('/ilanlar');

  return { success: true, message: 'İlan başarıyla kaldırıldı.' };
}
