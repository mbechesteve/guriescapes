import { siteContent, villas, meta } from './db';
import { defaultSiteContent, defaultVillas } from '$lib/content/defaults';

// Bump this whenever defaults change and you want the change pushed to an
// already-seeded database exactly once. Each bump re-applies the corrected
// defaults a single time, then leaves admin edits alone until the next bump.
const CONTENT_VERSION = 2;

let synced = false;

/**
 * One-time, version-gated content sync. On a fresh DB it seeds everything.
 * On an already-seeded DB whose stored version is behind, it re-applies the
 * corrected defaults once (site content + the default villas, by slug —
 * villas added in the admin are left untouched), then records the version so
 * future deploys don't overwrite admin edits.
 */
export async function ensureSeeded() {
  if (synced) return;
  try {
    const m = await meta();
    const cur = await m.findOne({ _id: 'content' });
    const applied = cur?.version || 0;

    if (applied < CONTENT_VERSION) {
      const sc = await siteContent();
      await sc.replaceOne({ _id: 'site' }, { ...defaultSiteContent }, { upsert: true });

      const vc = await villas();
      for (const v of defaultVillas) {
        await vc.updateOne(
          { slug: v.slug },
          { $set: { ...v }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
      }

      await m.updateOne(
        { _id: 'content' },
        { $set: { version: CONTENT_VERSION, appliedAt: new Date() } },
        { upsert: true }
      );
      console.log(`Content synced to version ${CONTENT_VERSION}`);
    }
    synced = true;
  } catch (e) {
    console.error('Content sync failed:', e);
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
