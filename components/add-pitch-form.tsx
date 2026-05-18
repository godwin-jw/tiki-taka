'use client';

import { useRef, useTransition } from 'react';
import { Plus, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addFieldAction } from '@/app/actions/fields';

/**
 * Yeni saha ekleme formu (client component).
 * Server action'dan dönen yanıta göre toast tetikler ve formu sıfırlar.
 */

/** Formda gösterilecek standart tesis özellikleri. */
const FACILITY_FEATURES = [
  'Servis İmkanı',
  'Krampon Kiralama',
  'Çay/Kahve İkramı',
  'Ücretsiz Otopark',
  'Sıcak Duş',
] as const;

export function AddPitchForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await addFieldAction(formData);
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-700">
          Saha Adı
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Örn: Olimpiyat Spor Tesisleri"
          required
          disabled={isPending}
          className="border-slate-200 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city" className="text-slate-700">
          Bulunduğu Şehir
        </Label>
        <Input
          id="city"
          name="city"
          placeholder="Örn: İstanbul"
          required
          disabled={isPending}
          className="border-slate-200 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price_per_hour" className="text-slate-700">
          Saatlik Ücret (₺)
        </Label>
        <Input
          id="price_per_hour"
          name="price_per_hour"
          type="number"
          min={0}
          step={50}
          placeholder="Örn: 1500"
          required
          disabled={isPending}
          className="border-slate-200 bg-white"
        />
      </div>

      {/* Tesis Özellikleri — çoklu checkbox grubu.
          Hepsi name="features" kullanır; server action tarafında
          formData.getAll('features') ile dizi olarak toplanır. */}
      <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-700">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          Tesis Özellikleri
        </legend>
        <p className="-mt-1 px-1 text-xs text-slate-500">
          Sahanızda sunduğunuz hizmetleri seçin.
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FACILITY_FEATURES.map((feature) => {
            const id = `feature-${feature.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`;
            return (
              <label
                key={feature}
                htmlFor={id}
                className="group flex cursor-pointer items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-900"
              >
                <input
                  id={id}
                  type="checkbox"
                  name="features"
                  value={feature}
                  disabled={isPending}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-0"
                />
                <span className="select-none font-medium">{feature}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full gap-2 bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Kaydediliyor…
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Sisteme Ekle
          </>
        )}
      </Button>
    </form>
  );
}
