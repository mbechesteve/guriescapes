import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, verifyToken } from '$lib/server/auth';
import { sessions } from '$lib/server/db';

export async function handle({ event, resolve }) {
  event.locals.admin = false;

  const token = verifyToken(event.cookies.get(SESSION_COOKIE));
  if (token) {
    try {
      const col = await sessions();
      const row = await col.findOne({ token });
      if (row && new Date(row.expiresAt) > new Date()) {
        event.locals.admin = true;
      }
    } catch (e) {
      console.error('Session lookup failed:', e);
    }
  }

  const { pathname } = event.url;
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!event.locals.admin) {
      throw redirect(302, '/admin/login');
    }
  }

  return resolve(event);
}
