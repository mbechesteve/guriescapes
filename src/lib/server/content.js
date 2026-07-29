import { siteContent, villas, meta } from './db';
import { defaultSiteContent, defaultVillas, MIGRATION } from '$lib/content/defaults';
import { computeSiteMigration } from './migrate';

// Bump this whenever defaults change and you want the change pushed to an
// already-seeded database exactly once. Each bump re-applies the corrected
// defaults a single time, then leaves admin edits alone until the next bump.
const CONTENT_VERSION = 6;

let synced = false;

/**
 * One-time, version-gated content sync. On a fresh DB it seeds everything.
 * On an already-seeded DB whose stored version is behind, it applies a
 * non-destructive migration: only fields missing entirely are added, and only
 * corrections whose current value still matches the old default are applied
 * — admin edits are never overwritten. Villas are inserted only if missing by
 * slug; existing villa docs (including any admin edits) are never touched.
 */
export async function ensureSeeded() {
  if (synced) return;
  try {
    const m = await meta();
    const cur = await m.findOne({ _id: 'content' });
    const applied = cur?.version || 0;
    if (applied >= CONTENT_VERSION) { synced = true; return; }

    const sc = await siteContent();
    const existing = await sc.findOne({ _id: 'site' });

    if (!existing) {
      // Fresh DB: seed full defaults (unchanged behaviour).
      await sc.insertOne({ ...defaultSiteContent });
    } else {
      // Existing DB: additive + conditional, never destructive.
      const patch = computeSiteMigration(existing, MIGRATION.additions, MIGRATION.corrections);
      if (patch) await sc.updateOne({ _id: 'site' }, patch);
      // Append resale FAQ once, only if absent. Atomic self-guarding filter:
      // the update only matches when no resale FAQ exists yet, so concurrent
      // serverless cold starts can push at most one entry, never duplicates.
      await sc.updateOne(
        { _id: 'site', faq: { $not: { $elemMatch: { q: { $regex: /resell|resale|exit/i } } } } },
        { $push: { faq: {
          q: 'Can I resell or exit my investment later?',
          a: 'Yes. Villas are transferable, and when you decide to exit we can help you sell or offload your investment to our ready pool of buyers — the same audience already drawn to Pongwe. As the managing operator we can market your villa with a proven income record, which supports resale value and liquidity.'
        } } }
      );
    }

    // Villas: insert missing default villas only; NEVER overwrite existing docs.
    const vc = await villas();
    for (const v of defaultVillas) {
      const found = await vc.findOne({ slug: v.slug });
      if (!found) await vc.insertOne({ ...v, createdAt: new Date() });
    }

    await m.updateOne(
      { _id: 'content' },
      { $set: { version: CONTENT_VERSION, appliedAt: new Date() } },
      { upsert: true }
    );
    console.log(`Content migrated to version ${CONTENT_VERSION}`);
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
