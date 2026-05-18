import { cookies } from 'next/headers';
import {
  CalendarRange,
  TrendingUp,
  Trophy,
  Activity,
  Inbox,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { parsePriceText } from '@/lib/utils';
import type { Field, Reservation } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReservationActions } from '@/components/reservation-actions';
import { StatusBadge } from '@/components/status-badge';

export const revalidate = 0;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(input: string | null | undefined): string {
  if (!input) return '-';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Sadece tarih kısmını (gün + ay + yıl) Türkçe formatla.
 * Müşterinin seçtiği maç gününü göstermek için kullanılır.
 */
function formatDateOnly(input: string | null | undefined): string {
  if (!input) return '-';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const ownerEmail = cookieStore.get('owner_email')?.value ?? '';

  // 1) Bu işletmecinin sahalarını çek
  const { data: ownedFields, error: fieldsError } = await supabase
    .from('fields')
    .select('*')
    .eq('owner_email', ownerEmail);

  if (fieldsError) {
    console.error('Sahalar çekilemedi:', fieldsError);
  }

  const fields: Field[] = (ownedFields as Field[] | null) ?? [];
  const fieldNames = fields.map((f) => f.name);

  // 2) Sadece kendi sahalarına ait rezervasyonları çek
  let reservations: Reservation[] = [];
  if (fieldNames.length > 0) {
    const { data: reservationData, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .in('field_name', fieldNames)
      .order('created_at', { ascending: false });

    if (reservationsError) {
      console.error('Rezervasyonlar çekilemedi:', reservationsError);
    }

    reservations = (reservationData as Reservation[] | null) ?? [];
  }

  // İstatistikler
  const totalReservations = reservations.length;
  const totalRevenue = reservations
    .filter((r) => (r.status ?? 'Pending') !== 'Rejected')
    .reduce((acc, curr) => acc + parsePriceText(curr.total_price), 0);
  const activeFields = fields.length;
  const pendingCount = reservations.filter(
    (r) => (r.status ?? 'Pending') === 'Pending'
  ).length;

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Başlık */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Genel Bakış
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Hoş geldiniz,{' '}
              <span className="font-medium text-slate-700">{ownerEmail}</span>.
              İşletmenizin anlık özetini buradan takip edin.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Sistem Çevrimiçi
          </div>
        </div>

        {/* İstatistik kartları */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Toplam Rezervasyon"
            value={totalReservations.toString()}
            description="Tüm zamanlardaki maç sayısı"
            icon={CalendarRange}
            accent="blue"
          />
          <StatCard
            label="Toplam Ciro"
            value={formatCurrency(totalRevenue)}
            description="Reddedilenler hariç"
            icon={TrendingUp}
            accent="emerald"
          />
          <StatCard
            label="Aktif Sahalar"
            value={activeFields.toString()}
            description="Sisteme kayıtlı tesisler"
            icon={Trophy}
            accent="violet"
          />
          <StatCard
            label="Bekleyen Talepler"
            value={pendingCount.toString()}
            description="Onayınızı bekliyor"
            icon={Activity}
            accent="amber"
          />
        </div>

        {/* Son rezervasyonlar */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Son Rezervasyonlar
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Sahalarınıza gelen güncel rezervasyon talepleri
              </CardDescription>
            </div>
            <span className="self-start rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 sm:self-auto">
              {totalReservations} kayıt
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {fieldNames.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="Henüz saha eklemediniz"
                description="Rezervasyon görebilmek için önce 'Saha Yönetimi' sekmesinden bir tesis tanımlayın."
              />
            ) : reservations.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Henüz bir rezervasyon yok"
                description="Sahalarınıza yapılan ilk rezervasyon bu listede anında görünecek."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="w-[180px]">Müşteri</TableHead>
                      <TableHead>Saha</TableHead>
                      <TableHead>Maç Zamanı</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((rez) => {
                      const status = rez.status ?? 'Pending';
                      return (
                        <TableRow
                          key={rez.id}
                          className="border-slate-100 hover:bg-slate-50/60"
                        >
                          <TableCell className="font-medium text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold uppercase text-slate-600">
                                {rez.user_name?.charAt(0) ?? '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate">{rez.user_name}</p>
                                <p className="text-[11px] font-normal text-slate-400">
                                  {formatDateTime(rez.created_at)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {rez.field_name}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            <div className="flex flex-col leading-tight">
                              <span className="text-sm font-medium text-slate-800">
                                {formatDateOnly(rez.created_at)}
                              </span>
                              <span className="text-xs text-slate-500">
                                Saat: {rez.match_time}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={status} />
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-800">
                            {formatCurrency(parsePriceText(rez.total_price))}
                          </TableCell>
                          <TableCell className="text-right">
                            {status === 'Pending' ? (
                              <ReservationActions reservationId={rez.id} />
                            ) : (
                              <span className="text-xs text-slate-400">
                                İşlem tamamlandı
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

/* --------------------------- Yardımcı Bileşenler --------------------------- */

interface StatCardProps {
  label: string;
  value: string;
  description: string;
  icon: typeof CalendarRange;
  accent: 'blue' | 'emerald' | 'violet' | 'amber';
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  accent,
}: StatCardProps) {
  const accentMap: Record<StatCardProps['accent'], string> = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    violet: 'bg-violet-50 text-violet-600 ring-violet-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset ${accentMap[accent]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Inbox;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
    </div>
  );
}
