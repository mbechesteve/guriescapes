import { siteContent, villas } from './db';
import { defaultSiteContent, defaultVillas } from '$lib/content/defaults';

let seeded = false;

/** Seed siteContent + villas from defaults once, if empty. */
export async function ensureSeeded() {
  if (seeded) return;
  try {
    const sc = await siteContent();
    if (!(await sc.findOne({ _id: 'site' }))) {
      await sc.insertOne({ ...defaultSiteContent });
    }
    const vc = await villas();
    if ((await vc.countDocuments({})) === 0) {
      await vc.insertMany(defaultVillas.map((v) => ({ ...v, createdAt: new Date() })));
    }
    seeded = true;
  } catch (e) {
    console.error('Seeding failed:', e);
  }
}

/** Read site content (falls back to defaults if DB unavailable). */
export async function getSiteContent() {
  try {
    await ensureSeeded();
    const sc = await siteContent();
    const doc = await sc.findOne({ _id: 'site' });
    return doc || defaultSiteContent;
  } catch (e) {
    console.error('getSiteContent failed:', e);
    return defaultSiteContent;
  }
}

function serializeVilla(v) {
  return {
    id: v._id ? v._id.toString() : null,
    slug: v.slug,
    name: v.name || '',
    order: v.order ?? 0,
    published: v.published !== false,
    plotM2: v.plotM2 || '',
    builtUpM2: v.builtUpM2 || '',
    bedrooms: v.bedrooms || '',
    priceFrom: v.priceFrom || '',
    tagline: v.tagline || '',
    heroImage: v.heroImage || '',
    cardImage: v.cardImage || v.heroImage || '',
    intro: Array.isArray(v.intro) ? v.intro : [],
    spec: Array.isArray(v.spec) ? v.spec : [],
    gallery: Array.isArray(v.gallery) ? v.gallery : []
  };
}

/** Published villas for the public site, ordered. */
export async function getPublishedVillas() {
  try {
    await ensureSeeded();
    const vc = await villas();
    const list = await vc.find({ published: { $ne: false } }).sort({ order: 1, createdAt: 1 }).toArray();
    return list.map(serializeVilla);
  } catch (e) {
    console.error('getPublishedVillas failed:', e);
    return defaultVillas.map(serializeVilla);
  }
}

/** A single published villa by slug, or null. */
export async function getVillaBySlug(slug) {
  try {
    await ensureSeeded();
    const vc = await villas();
    const v = await vc.findOne({ slug });
    return v ? serializeVilla(v) : null;
  } catch (e) {
    console.error('getVillaBySlug failed:', e);
    const v = defaultVillas.find((x) => x.slug === slug);
    return v ? serializeVilla(v) : null;
  }
}

export { serializeVilla };
