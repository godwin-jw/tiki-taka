import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (formerly known as middleware).
 * Korunan rotalar: "/", "/sahalar", "/ilanlar".
 * "owner_email" çerezi yoksa ve istenen yol "/login" değilse,
 * kullanıcıyı /login sayfasına yönlendirir.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ownerEmail = request.cookies.get('owner_email')?.value;

  // Login sayfası serbest, diğerleri için çerez zorunlu
  if (!ownerEmail && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/sahalar', '/ilanlar'],
};
