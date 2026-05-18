'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * "Çıkış Yap" işlemi: owner_email çerezini siler ve /login'e yönlendirir.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('owner_email');
  redirect('/login');
}
