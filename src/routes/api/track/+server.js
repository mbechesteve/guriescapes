import { json } from '@sveltejs/kit';
import { pageviews } from '$lib/server/db';

// Records a public page view. Fire-and-forget from the client on navigation.
export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, { status: 400 });
  }

  let path = String(body.path ?? '').slice(0, 200);
  // Only track internal, non-admin paths.
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) {
    return json({ ok: false }, { status: 400 });
  }
  // Normalise: strip query/hash, drop trailing slash (keep root).
  path = path.split('?')[0].split('#')[0];
  if (path.length > 1) path = path.replace(/\/+$/, '');

  try {
    const col = await pageviews();
    await col.insertOne({ path, createdAt: new Date() });
  } catch (e) {
    console.error('track failed:', e);
    return json({ ok: false }, { status: 500 });
  }
  return json({ ok: true });
}
