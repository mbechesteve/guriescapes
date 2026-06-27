import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, verifyToken } from '$lib/server/auth';
import { sessions } from '$lib/server/db';

export async function POST({ cookies }) {
  const token = verifyToken(cookies.get(SESSION_COOKIE));
  if (token) {
    try {
      const col = await sessions();
      await col.deleteOne({ token });
    } catch (e) {
      console.error('Could not delete session:', e);
    }
  }
  cookies.delete(SESSION_COOKIE, { path: '/' });
  throw redirect(303, '/admin/login');
}
