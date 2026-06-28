import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { images } from '$lib/server/db';

// Detect a real raster image from its magic bytes. Deliberately excludes SVG
// (which can carry script) and anything that isn't a known safe raster format.
function sniffImageType(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length > 3 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

// Admin-only image upload. Stores the file in MongoDB by default (served via
// /api/img/[id]); uses Vercel Blob instead when BLOB_READ_WRITE_TOKEN is set.
export async function POST({ request, locals }) {
  if (!locals.admin) throw error(401, 'Unauthorized');

  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') throw error(400, 'No file provided');
  if (file.size > 10 * 1024 * 1024) throw error(413, 'Image too large (max 10MB).');

  // Verify the bytes really are a safe raster image — never trust the sent type.
  const buf = Buffer.from(await file.arrayBuffer());
  const contentType = sniffImageType(buf);
  if (!contentType) throw error(400, 'Unsupported image. Please upload a JPG, PNG, GIF or WebP.');

  // Optional: use Vercel Blob/CDN if configured.
  if (env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put('villas/image', buf, {
        access: 'public',
        addRandomSuffix: true,
        contentType,
        token: env.BLOB_READ_WRITE_TOKEN
      });
      return json({ url: blob.url });
    } catch (e) {
      console.error('Blob upload failed, falling back to MongoDB:', e);
    }
  }

  // Default: store the image in MongoDB.
  try {
    const col = await images();
    const r = await col.insertOne({
      data: buf,
      contentType,
      size: file.size,
      createdAt: new Date()
    });
    return json({ url: `/api/img/${r.insertedId.toString()}` });
  } catch (e) {
    console.error('MongoDB image store failed:', e);
    throw error(500, 'Upload failed. Please try again.');
  }
}
