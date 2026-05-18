/**
 * HaliSaha+ veritabanı varlıkları için TypeScript arayüzleri.
 * Supabase'deki tabloların satır şekillerini birebir yansıtır.
 */

export interface Field {
  id: number;
  name: string;
  city: string;
  /** Saatlik ücret (Supabase'de `price_per_hour` kolonu — TEXT) */
  price_per_hour: string;
  /** Sahayı kayıt eden işletmecinin e-postası */
  owner_email: string;
  /** Virgülle ayrılmış tesis özellikleri (örn: "Servis, Krampon, Çay İkramı") */
  features?: string;
}

export type ReservationStatus = 'Pending' | 'Confirmed' | 'Rejected';

export interface Reservation {
  id: number;
  user_name: string;
  field_name: string;
  match_time: string;
  /** Toplam tutar (TEXT — parseInt ile sayıya dönüştürülmeli) */
  total_price: string;
  status: ReservationStatus | null;
  created_at: string;
}

export interface MissingPlayer {
  id: number;
  field_name: string;
  match_time: string;
  missing_roles: string;
  created_at: string;
}

/**
 * Server Action'lardan dönen standart yanıt zarfı.
 * Toast mesajları client tarafında bu objeye göre gösterilir.
 */
export interface ActionResponse {
  success: boolean;
  message: string;
}
