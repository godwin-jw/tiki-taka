import { cookies } from 'next/headers';
import { Megaphone, Users, Calendar, MapPin } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import type { Field, MissingPlayer } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { DeleteIlanButton } from '@/components/delete-ilan-button';

export const revalidate = 0;

function formatDate(input: string | null | undefined): string {
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

export default async function IlanlarPage() {
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

  // 2) Yalnızca kendi sahalarındaki ilanları çek
  let ilanlar: MissingPlayer[] = [];
  if (fieldNames.length > 0) {
    const { data, error } = await supabase
      .from('missing_players')
      .select('*')
      .in('field_name', fieldNames)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('İlanlar çekilemedi:', error);
    }
    ilanlar = (data as MissingPlayer[] | null) ?? [];
  }

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Başlık */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Topluluk
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Adam Eksik İlanları
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Mobil uygulamadan gelen oyuncu arama ilanlarını denetleyin ve gerektiğinde kaldırın.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 sm:flex">
            <Megaphone className="h-3.5 w-3.5 text-emerald-600" />
            {ilanlar.length} aktif ilan
          </div>
        </div>

        {/* Tablo */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900">
              Aktif İlanlar
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Sahalarınızda yayında olan güncel oyuncu talepleri
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {fieldNames.length === 0 ? (
              <EmptyState
                title="Henüz saha eklemediniz"
                description="İlan görebilmek için önce 'Saha Yönetimi' sekmesinden bir tesis tanımlayın."
              />
            ) : ilanlar.length === 0 ? (
              <EmptyState
                title="Aktif ilan bulunmuyor"
                description="Sahalarınız için yayınlanan oyuncu talepleri burada listelenecek."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead>Saha</TableHead>
                      <TableHead>Maç Zamanı</TableHead>
                      <TableHead>Eksik Mevkiler</TableHead>
                      <TableHead>Yayınlanma</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ilanlar.map((ilan) => (
                      <TableRow
                        key={ilan.id}
                        className="border-slate-100 hover:bg-slate-50/60"
                      >
                        <TableCell className="font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                            {ilan.field_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {ilan.match_time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="gap-1.5 bg-blue-50 font-medium text-blue-700 ring-1 ring-inset ring-blue-100 hover:bg-blue-50"
                          >
                            <Users className="h-3 w-3" />
                            {ilan.missing_roles}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatDate(ilan.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DeleteIlanButton ilanId={ilan.id} />
                        </TableCell>
                      </TableRow>
                    ))}
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

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Megaphone className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
    </div>
  );
}
