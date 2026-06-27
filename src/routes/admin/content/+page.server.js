import { fail } from '@sveltejs/kit';
import { siteContent } from '$lib/server/db';
import { getSiteContent } from '$lib/server/content';

export async function load() {
  const site = await getSiteContent();
  return { hero: site.hero, metrics: site.metrics, contact: site.contact, faq: site.faq };
}

const s = (v, n) => String(v ?? '').slice(0, n);

export const actions = {
  default: async ({ request }) => {
    const fd = await request.formData();
    let p;
    try {
      p = JSON.parse(fd.get('payload'));
    } catch {
      return fail(400, { error: 'Invalid data' });
    }
    const doc = {
      hero: {
        eyebrow: s(p.hero?.eyebrow, 200),
        headline: s(p.hero?.headline, 300),
        sub: s(p.hero?.sub, 600),
        priceFrom: s(p.hero?.priceFrom, 40)
      },
      metrics: (Array.isArray(p.metrics) ? p.metrics : []).slice(0, 8).map((m) => ({
        num: s(m.num, 40), label: s(m.label, 60), cap: s(m.cap, 160)
      })),
      contact: {
        email: s(p.contact?.email, 200),
        phone: s(p.contact?.phone, 60),
        whatsapp: s(p.contact?.whatsapp, 40),
        instagram: s(p.contact?.instagram, 200),
        facebook: s(p.contact?.facebook, 200)
      },
      faq: (Array.isArray(p.faq) ? p.faq : []).slice(0, 30).map((f) => ({
        q: s(f.q, 300), a: s(f.a, 2000)
      }))
    };
    try {
      const sc = await siteContent();
      await sc.updateOne({ _id: 'site' }, { $set: doc }, { upsert: true });
    } catch (e) {
      console.error('Save content failed:', e);
      return fail(500, { error: 'Could not save changes' });
    }
    return { success: true };
  }
};
