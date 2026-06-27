import { json, error } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { env } from '$env/dynamic/private';

// Admin-only image upload to Vercel Blob. Returns the public URL.
export async function POST({ request, locals }) {
  if (!locals.admin) throw error(401, 'Unauthorized');
  if (!env.BLOB_READ_WRITE_TOKEN) {
    throw error(503, 'Image uploads are not configured. Set BLOB_READ_WRITE_TOKEN, or paste an image URL instead.');
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') throw error(400, 'No file provided');
  if (file.size > 15 * 1024 * 1024) throw error(413, 'Image too large (max 15MB).');

  const safe = (file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
  try {
    const blob = await put(`villas/${safe}`, file, {
      access: 'public',
      addRandomSuffix: true,
      token: env.BLOB_READ_WRITE_TOKEN
    });
    return json({ url: blob.url });
  } catch (e) {
    console.error('Blob upload failed:', e);
    throw error(500, 'Upload failed. Please try again.');
  }
}
