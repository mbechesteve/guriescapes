import { error } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { images } from '$lib/server/db';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

// Serves an image stored in MongoDB, hardened against being used to deliver
// active content (script) from our own origin.
export async function GET({ params }) {
  if (!ObjectId.isValid(params.id)) throw error(404, 'Not found');
  const col = await images();
  const doc = await col.findOne({ _id: new ObjectId(params.id) });
  if (!doc || !doc.data) throw error(404, 'Image not found');

  const bin = doc.data;
  const bytes = bin && bin.buffer ? Buffer.from(bin.buffer) : Buffer.from(bin);

  // Only ever serve a known safe raster type; never echo an arbitrary type.
  const type = ALLOWED.has(doc.contentType) ? doc.contentType : 'application/octet-stream';

  return new Response(bytes, {
    headers: {
      'content-type': type,
      'content-length': String(bytes.length),
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline',
      'content-security-policy': "default-src 'none'; sandbox; style-src 'none'"
    }
  });
}
