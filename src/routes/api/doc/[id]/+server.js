import { error } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { documents } from '$lib/server/db';

export async function GET({ params }) {
  if (!ObjectId.isValid(params.id)) throw error(404, 'Not found');
  const col = await documents();
  const doc = await col.findOne({ _id: new ObjectId(params.id) });
  if (!doc || !doc.data) throw error(404, 'Not found');
  const bin = doc.data;
  const bytes = bin && bin.buffer ? Buffer.from(bin.buffer) : Buffer.from(bin);
  const safeName = String(doc.name || 'brochure.pdf').replace(/[^\w.\- ]+/g, '');
  return new Response(bytes, {
    headers: {
      'content-type': 'application/pdf',
      'content-length': String(bytes.length),
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
      'content-disposition': `attachment; filename="${safeName}"`
    }
  });
}
