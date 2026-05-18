import { createClient } from '@supabase/supabase-js';

/**
 * Supabase istemcisi.
 * NEXT_PUBLIC_ önekli olduğu için hem sunucu hem istemci tarafında okunabilir.
 * Hatalı bir build esnasında ortam değişkenleri eksikse erken hata fırlatıyoruz.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase ortam değişkenleri eksik. Lütfen .env.local dosyasını kontrol edin.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
