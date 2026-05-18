import { Loader2 } from 'lucide-react';

/**
 * Global yükleme durumu.
 * Server-side render beklenirken modern, ortalanmış spinner gösterir.
 */
export default function Loading() {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-4 bg-slate-50 p-8">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">Yükleniyor</p>
        <p className="mt-1 text-xs text-slate-500">
          Veriler hazırlanıyor, lütfen bekleyin…
        </p>
      </div>
    </div>
  );
}
