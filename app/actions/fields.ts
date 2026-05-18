'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { supabase } from '@/lib/supabase';
import type { ActionResponse } from '@/lib/types';

/**
 * Yeni saha kaydı oluşturur.
 * owner_email çerezden otomatik olarak yazılır — istemciden gönderilmez.
 */
export async function addFieldAction(
  formData: FormData
): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const ownerEmail = cookieStore.get('owner_email')?.value;

  if (!ownerEmail) {
    return {
      success: false,
      message: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.',
    };
  }

  const name = (formData.get('name') as string | null)?.trim();
  const city = (formData.get('city') as string | null)?.trim();
  const rawPrice = (formData.get('price_per_hour') as string | null)?.trim();

  // Çoklu checkbox: aynı `features` adıyla gönderilen seçili kutuları topla
  // ve tek bir virgül-boşluk ile ayrılmış string'e indirgeyerek TEXT kolonuna yaz.
  const featuresArray = formData
    .getAll('features')
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v.length > 0);
  const featuresString = featuresArray.join(', ');

  if (!name || !city) {
    return {
      success: false,
      message: 'Lütfen saha adı ve şehir alanlarını doldurun.',
    };
  }

  // Crash-proof fiyat: boş, null, undefined ya da '' ise '0'.
  // Tablodaki price_per_hour TEXT + NOT NULL olduğu için her zaman
  // güvenli bir string göndermek zorundayız.
  const safePricePerHour: string =
    rawPrice && rawPrice !== '' ? rawPrice : '0';

  // NOT (Mimari kural #2): supabase-js istemcisi süreç boyunca PostgREST
  // schema'sını bellekte tutuyor ve "schema cache" güncel olmadığında
  // PGRST204 hatası dönüyor. Bunu aşmak için INSERT'ı doğrudan PostgREST REST
  // endpoint'ine `fetch` ile, `Prefer: return=minimal` başlığıyla gönderiyoruz.
  // Geri dönen satıra ihtiyacımız yok — sadece HTTP status kodunu kontrol ediyoruz.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let restError: { code?: string; message?: string } | null = null;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/fields`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        // Tercih edilen: cevap gövdesi olmadan, schema cache yerine
        // sütun adlarını doğrudan PostgREST'e bırak.
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        name,
        city,
        // Supabase'deki gerçek kolon adı `price_per_hour` (TEXT, NOT NULL).
        // Mimari kural #3: integer'a cast ETMEYİN — daima string gönderin.
        price_per_hour: safePricePerHour,
        owner_email: ownerEmail,
        // Virgülle ayrılmış tesis özellikleri (TEXT). Boşsa '' gönderilir.
        features: featuresString,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      try {
        restError = JSON.parse(text);
      } catch {
        restError = { message: text || `HTTP ${res.status}` };
      }
    }
  } catch (e) {
    restError = {
      message: e instanceof Error ? e.message : 'Bilinmeyen ağ hatası',
    };
  }

  if (restError) {
    console.error('Saha eklenirken hata:', restError);

    const isUniqueViolation =
      restError.code === '23505' ||
      /duplicate key|unique constraint/i.test(restError.message ?? '');

    if (isUniqueViolation) {
      return {
        success: false,
        message: 'Bu isimde bir saha zaten kayıtlı.',
      };
    }

    return {
      success: false,
      message:
        restError.message ||
        'Saha eklenemedi. Lütfen daha sonra tekrar deneyin.',
    };
  }

  revalidatePath('/sahalar');
  revalidatePath('/');

  return {
    success: true,
    message: `"${name}" başarıyla eklendi.`,
  };
}

/**
 * Sadece sahibi olan işletmecinin sahasını silmesine izin verir.
 */
export async function deleteFieldAction(
  id: number
): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const ownerEmail = cookieStore.get('owner_email')?.value;

  if (!ownerEmail) {
    return { success: false, message: 'Oturum bulunamadı.' };
  }

  if (!id) {
    return { success: false, message: 'Geçersiz saha kimliği.' };
  }

  const { error } = await supabase
    .from('fields')
    .delete()
    .eq('id', id)
    .eq('owner_email', ownerEmail);

  if (error) {
    console.error('Saha silinirken hata:', error);
    return { success: false, message: 'Saha silinemedi.' };
  }

  revalidatePath('/sahalar');
  revalidatePath('/');

  return { success: true, message: 'Saha kaldırıldı.' };
}
