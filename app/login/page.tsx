import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const revalidate = 0;

export default async function LoginPage() {
  // Zaten girişli ise dashboard'a yönlendir
  const cookieStore = await cookies();
  const existing = cookieStore.get('owner_email')?.value;
  if (existing) {
    redirect('/');
  }

  async function handleLogin(formData: FormData) {
    'use server';

    const email = formData.get('email') as string | null;

    if (!email || !email.includes('@')) {
      return;
    }

    const cookieStore = await cookies();
    cookieStore.set('owner_email', email.trim().toLowerCase(), {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    });

    redirect('/');
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      {/* Arka Plan Görseli */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1ee7a5342c52?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/95 to-emerald-950/40" />

      {/* Dekoratif glow */}
      <div className="absolute top-1/4 -left-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-1/4 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <Card className="relative z-10 w-full max-w-md border-slate-800 bg-slate-950/70 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            TikiTaka<span className="text-emerald-500">+</span> İşletme
          </CardTitle>
          <CardDescription className="text-slate-400">
            Saha yönetim paneline erişmek için giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                İşletmeci E-posta Adresi
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@halisaha.com"
                  required
                  className="border-slate-700 bg-slate-900/80 pl-10 text-white placeholder:text-slate-600 focus-visible:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Şifre
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="border-slate-700 bg-slate-900/80 pl-10 text-white placeholder:text-slate-600 focus-visible:border-emerald-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="group h-11 w-full bg-emerald-600 font-semibold text-white shadow-lg shadow-emerald-900/50 hover:bg-emerald-700"
            >
              Sisteme Giriş Yap
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <p className="text-center text-xs text-slate-500">
              Sadece kayıtlı işletme sahipleri bu panele erişebilir.
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
