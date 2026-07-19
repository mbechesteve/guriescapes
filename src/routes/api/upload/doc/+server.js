import { json, error } from '@sveltejs/kit';
import { documents } from '$lib/server/db';

// Admin-only PDF upload. Verifies the %PDF- magic bytes; stores in MongoDB.
export async function POST({ request, locals }) {
  if (!locals.admin) throw error(401, 'Unauthorized');
  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') throw error(400, 'No file provided');
  if (file.size > 15 * 1024 * 1024) throw error(413, 'PDF too large (max 15MB).');

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length < 5 || buf.toString('ascii', 0, 5) !== '%PDF-') {
    throw error(400, 'Unsupported file. Please upload a PDF.');
  }
  const name = String(file.name || 'brochure.pdf').replace(/[^\w.\- ]+/g, '').slice(0, 120) || 'brochure.pdf';
  try {
    const col = await documents();
    const r = await col.insertOne({ data: buf, contentType: 'application/pdf', name, size: file.size, createdAt: new Date() });
    return json({ url: `/api/doc/${r.insertedId.toString()}`, name });
  } catch (e) {
    console.error('PDF store failed:', e);
    throw error(500, 'Upload failed. Please try again.');
  }
}
