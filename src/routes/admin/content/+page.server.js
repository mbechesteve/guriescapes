import { fail } from '@sveltejs/kit';
import { siteContent } from '$lib/server/db';
import { getSiteContent } from '$lib/server/content';

export async function load() {
  const site = await getSiteContent();
  return {
    hero: site.hero, metrics: site.metrics, contact: site.contact, faq: site.faq,
    developer: site.developer || { eyebrow: '', heading: '', since: '', body: [], image: '' },
    testimonials: site.testimonials || [],
    trustBar: site.trustBar || { zipa: '', remaxReportUrl: '', note: '', press: [] },
    renders: site.renders || [], floorPlans: site.floorPlans || [], progress: site.progress || [],
    availability: site.availability || { reserved: '', total: '', note: '' },
    brochure: site.brochure || { fileUrl: '', name: '', uploadedAt: null }
  };
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
    const arr = (v) => (Array.isArray(v) ? v : []);
    doc.contact.phoneTz = s(p.contact?.phoneTz, 60);
    doc.contact.whatsappNote = s(p.contact?.whatsappNote, 120);
    doc.contact.calendly = s(p.contact?.calendly, 300);
    doc.developer = {
      eyebrow: s(p.developer?.eyebrow, 120), heading: s(p.developer?.heading, 200),
      since: s(p.developer?.since, 60), image: s(p.developer?.image, 300),
      body: arr(p.developer?.body).slice(0, 8).map((x) => s(x, 1200))
    };
    doc.testimonials = arr(p.testimonials).slice(0, 12).map((t) => ({ quote: s(t.quote, 800), name: s(t.name, 120), role: s(t.role, 120) }));
    doc.trustBar = {
      zipa: s(p.trustBar?.zipa, 160), remaxReportUrl: s(p.trustBar?.remaxReportUrl, 300), note: s(p.trustBar?.note, 400),
      press: arr(p.trustBar?.press).slice(0, 10).map((x) => ({ label: s(x.label, 120), url: s(x.url, 300) }))
    };
    const imgArr = (a) => arr(a).slice(0, 20).map((x) => ({ src: s(x.src, 300), alt: s(x.alt, 200), caption: s(x.caption, 200), ...(x.date !== undefined ? { date: s(x.date, 40) } : {}) }));
    doc.renders = imgArr(p.renders); doc.floorPlans = imgArr(p.floorPlans); doc.progress = imgArr(p.progress);
    doc.availability = { reserved: s(p.availability?.reserved, 12), total: s(p.availability?.total, 12), note: s(p.availability?.note, 160) };
    doc.brochure = { fileUrl: s(p.brochure?.fileUrl, 300), name: s(p.brochure?.name, 160), uploadedAt: p.brochure?.uploadedAt || null };
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
