import { cookies } from 'next/headers';
import { Building2, MapPin, Banknote, Trophy } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { formatPriceText } from '@/lib/utils';
import type { Field } from '@/lib/types';
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
import { AddPitchForm } from '@/components/add-pitch-form';
import { DeleteFieldButton } from '@/components/delete-field-button';

export const revalidate = 0;

export default async function SahalarPage() {
  const cookieStore = await cookies();
  const ownerEmail = cookieStore.get('owner_email')?.value ?? '';

  // Sadece bu işletmeciye ait sahaları getir
  const { data, error } = await supabase
    .from('fields')
    .select('*')
    .eq('owner_email', ownerEmail)
    .order('id', { ascending: true });

  if (error) {
    console.error('Sahalar çekilirken hata:', error);
  }

  const fields: Field[] = (data as Field[] | null) ?? [];

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Başlık */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Tesis Yönetimi
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Saha Yönetimi
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sisteme yeni halı saha ekleyin veya mevcut tesislerinizi yönetin.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* SOL: Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Yeni Saha Ekle
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Anında listede görüntülenir
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <AddPitchForm />
              </CardContent>
            </Card>
          </div>

          {/* SAĞ: Tablo */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Mevcut Sahalarınız
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Aktif olarak rezervasyon kabul eden tesisleriniz
                  </CardDescription>
                </div>
                <span className="self-start rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 sm:self-auto">
                  {fields.length} saha
                </span>
              </CardHeader>
              <CardContent className="p-0">
                {fields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <Trophy className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Henüz saha eklenmedi
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-slate-500">
                      Soldaki formu kullanarak ilk halı sahanızı sisteme tanımlayın.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="hover:bg-slate-50">
                          <TableHead>Saha Adı</TableHead>
                          <TableHead>Şehir</TableHead>
                          <TableHead>Özellikler</TableHead>
                          <TableHead className="text-right">
                            Saatlik Ücret
                          </TableHead>
                          <TableHead className="text-right">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field) => (
                          <TableRow
                            key={field.id}
                            className="border-slate-100 hover:bg-slate-50/60"
                          >
                            <TableCell className="font-medium text-slate-900">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
                                  <Trophy className="h-4 w-4 text-emerald-600" />
                                </div>
                                <span>{field.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                {field.city}
                              </span>
                            </TableCell>
                            <TableCell>
                              {field.features ? (
                                <div className="flex flex-wrap gap-1">
                                  {field.features
                                    .split(',')
                                    .map((f) => f.trim())
                                    .filter((f) => f.length > 0)
                                    .map((feature) => (
                                      <Badge
                                        key={feature}
                                        className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                      >
                                        {feature}
                                      </Badge>
                                    ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                                <Banknote className="h-3.5 w-3.5" />
                                {formatPriceText(field.price_per_hour)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DeleteFieldButton
                                fieldId={field.id}
                                fieldName={field.name}
                              />
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
        </div>
      </div>
    </main>
  );
}
