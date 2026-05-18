import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';

import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'HaliSaha+ Admin Paneli',
  description: 'İşletmeciler için modern halı saha rezervasyon yönetim sistemi',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sidebar'ı yalnızca giriş yapmış kullanıcılara göster.
  // Login sayfası ve oturumsuz erişimlerde tam ekran içerik gösterilir.
  const cookieStore = await cookies();
  const ownerEmail = cookieStore.get('owner_email')?.value ?? null;

  return (
    <html lang="tr" className={inter.variable}>
      <body className="font-sans antialiased">
        {ownerEmail ? (
          <div className="flex h-screen flex-col overflow-hidden bg-slate-50 md:flex-row">
            <Sidebar ownerEmail={ownerEmail} />
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        ) : (
          <>{children}</>
        )}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
