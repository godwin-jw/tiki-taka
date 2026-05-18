'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Users,
  LogOut,
  Menu,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { logoutAction } from '@/app/actions/auth';

interface SidebarProps {
  ownerEmail: string | null;
}

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/sahalar',
    label: 'Saha Yönetimi',
    icon: Trophy,
  },
  {
    href: '/ilanlar',
    label: 'Adam Eksik İlanları',
    icon: Users,
  },
] as const;

function SidebarBody({
  ownerEmail,
  onNavigate,
}: {
  ownerEmail: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-slate-300">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              TikiTaka<span className="text-emerald-500">+</span>
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              İşletme Paneli
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-2 h-px bg-slate-800/80" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Menü
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-500/10 text-white ring-1 ring-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  isActive
                    ? 'text-emerald-400'
                    : 'text-slate-500 group-hover:text-slate-200'
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-900/60 p-3 ring-1 ring-slate-800">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold uppercase text-white">
            {ownerEmail?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {ownerEmail || 'Misafir'}
            </p>
            <p className="text-[10px] text-slate-500">İşletme Sahibi</p>
          </div>
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </Button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({ ownerEmail }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 md:flex">
        <SidebarBody ownerEmail={ownerEmail} />
      </aside>

      {/* Mobile Top Bar */}
      <div className="flex w-full items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Menüyü aç">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 border-slate-800 p-0">
            <SheetTitle className="sr-only">Navigasyon Menüsü</SheetTitle>
            <SheetDescription className="sr-only">
              HaliSaha+ İşletme paneli ana menüsü
            </SheetDescription>
            <SidebarBody
              ownerEmail={ownerEmail}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-bold text-slate-900">
            HaliSaha<span className="text-emerald-600">+</span>
          </span>
        </div>

        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-center text-sm font-bold uppercase leading-8 text-white">
          {ownerEmail?.charAt(0) || 'A'}
        </div>
      </div>
    </>
  );
}
