import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { checkCredentials, createSessionToken, signToken, SESSION_COOKIE, SESSION_TTL_MS } from '$lib/server/auth';
import { sessions } from '$lib/server/db';

export function load({ locals }) {
  if (locals.admin) throw redirect(303, '/admin');
  return {};
}

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const username = form.get('username');
    const password = form.get('password');

    if (!checkCredentials(username, password)) {
      return fail(401, { error: 'Incorrect username or password.', username: String(username ?? '') });
    }

    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    try {
      const col = await sessions();
      await col.insertOne({ token, createdAt: new Date(), expiresAt });
    } catch (e) {
      console.error('Could not create session:', e);
      return fail(500, { error: 'Could not sign in right now. Please try again.' });
    }

    cookies.set(SESSION_COOKIE, signToken(token), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: !dev,
      maxAge: Math.floor(SESSION_TTL_MS / 1000)
    });

    throw redirect(303, '/admin');
  }
};
