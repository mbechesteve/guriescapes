import { error, fail } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { villas } from '$lib/server/db';

const s = (v, n) => String(v ?? '').slice(0, n);

export async function load({ params }) {
  if (!ObjectId.isValid(params.id)) throw error(404, 'Villa not found');
  const vc = await villas();
  const v = await vc.findOne({ _id: new ObjectId(params.id) });
  if (!v) throw error(404, 'Villa not found');
  return {
    villa: {
      id: v._id.toString(),
      slug: v.slug || '',
      name: v.name || '',
      order: v.order ?? 0,
      published: v.published !== false,
      plotM2: v.plotM2 || '',
      builtUpM2: v.builtUpM2 || '',
      bedrooms: v.bedrooms || '',
      priceFrom: v.priceFrom || '',
      tagline: v.tagline || '',
      heroImage: v.heroImage || '',
      cardImage: v.cardImage || '',
      intro: Array.isArray(v.intro) ? v.intro : [],
      spec: Array.isArray(v.spec) ? v.spec : [],
      gallery: Array.isArray(v.gallery) ? v.gallery : []
    }
  };
}

export const actions = {
  default: async ({ params, request }) => {
    if (!ObjectId.isValid(params.id)) return fail(400, { error: 'Invalid id' });
    const fd = await request.formData();
    let p;
    try {
      p = JSON.parse(fd.get('payload'));
    } catch {
      return fail(400, { error: 'Invalid data' });
    }

    const slug = s(p.slug, 80).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'villa';
    const doc = {
      slug,
      name: s(p.name, 160),
      order: Number(p.order) || 0,
      published: !!p.published,
      plotM2: s(p.plotM2, 40),
      builtUpM2: s(p.builtUpM2, 40),
      bedrooms: s(p.bedrooms, 20),
      priceFrom: s(p.priceFrom, 40),
      tagline: s(p.tagline, 300),
      heroImage: s(p.heroImage, 600),
      cardImage: s(p.cardImage, 600) || s(p.heroImage, 600),
      intro: (Array.isArray(p.intro) ? p.intro : []).slice(0, 6).map((x) => s(x, 2000)).filter(Boolean),
      spec: (Array.isArray(p.spec) ? p.spec : []).slice(0, 12).map((x) => ({ k: s(x.k, 60), v: s(x.v, 120) })).filter((x) => x.k || x.v),
      gallery: (Array.isArray(p.gallery) ? p.gallery : []).slice(0, 40).map((x) => ({ src: s(x.src, 600), alt: s(x.alt, 200) })).filter((x) => x.src),
      updatedAt: new Date()
    };

    try {
      const vc = await villas();
      const clash = await vc.findOne({ slug: doc.slug, _id: { $ne: new ObjectId(params.id) } });
      if (clash) return fail(400, { error: `The URL slug “${doc.slug}” is already used by another villa.` });
      await vc.updateOne({ _id: new ObjectId(params.id) }, { $set: doc });
    } catch (e) {
      console.error('Save villa failed:', e);
      return fail(500, { error: 'Could not save changes' });
    }
    return { success: true };
  }
};
