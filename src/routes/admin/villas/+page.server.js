import { fail, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { villas } from '$lib/server/db';
import { ensureSeeded } from '$lib/server/content';

export async function load() {
  await ensureSeeded();
  const vc = await villas();
  const list = await vc.find({}).sort({ order: 1, createdAt: 1 }).toArray();
  return {
    villas: list.map((v) => ({
      id: v._id.toString(),
      slug: v.slug,
      name: v.name || '(untitled)',
      priceFrom: v.priceFrom || '',
      published: v.published !== false,
      order: v.order ?? 0,
      cardImage: v.cardImage || v.heroImage || ''
    }))
  };
}

export const actions = {
  create: async () => {
    const vc = await villas();
    const count = await vc.countDocuments({});
    const slug = 'new-villa-' + (count + 1) + '-' + Math.random().toString(36).slice(2, 6);
    const r = await vc.insertOne({
      slug, name: 'New villa', order: count + 1, published: false,
      plotM2: '', builtUpM2: '', bedrooms: '2', priceFrom: '', tagline: '',
      heroImage: '', cardImage: '', intro: [], spec: [], gallery: [], createdAt: new Date()
    });
    throw redirect(303, '/admin/villas/' + r.insertedId.toString());
  },
  delete: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id') || '');
    if (!ObjectId.isValid(id)) return fail(400, { error: 'Invalid id' });
    const vc = await villas();
    await vc.deleteOne({ _id: new ObjectId(id) });
    return { success: true };
  },
  togglePublish: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id') || '');
    const published = fd.get('published') === 'true';
    if (!ObjectId.isValid(id)) return fail(400, { error: 'Invalid id' });
    const vc = await villas();
    await vc.updateOne({ _id: new ObjectId(id) }, { $set: { published } });
    return { success: true };
  }
};
