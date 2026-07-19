# Conversion, Trust & SEO Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the 13-item conversion/trust/SEO brief for the Guri Escapes SvelteKit site without destroying any existing production content, leads, or uploaded assets.

**Architecture:** DB-driven content on a single Mongo `site` document seeded from `defaults.js`, edited via `/admin/content`. New content is additive and optional (sections hide when empty). The risky content-version migration is replaced by a pure, unit-tested function that only fills absent fields and corrects still-default copy. Brochure delivery reuses the existing Mongo-upload + Resend patterns.

**Tech Stack:** SvelteKit 2 / Svelte 4, MongoDB (driver 6), Vercel adapter, Resend (HTTP), `node:test` for the one unit-tested module.

## Global Constraints

- **Non-destructive:** never `replaceOne` the `site` doc; never `$set` default fields over existing `villa-a`/`villa-b`; never touch `enquiries`, `images`, `pageviews`, `sessions`. Copy corrections apply **only** where the stored value still equals the known-old default. (spec §0, §1)
- **CMS-first + hide-when-empty:** every asset/data-dependent section renders nothing when its field is empty. No fabricated numbers. (spec §0.2)
- **Best-effort email:** email sending never blocks or fails the enquiry response. (spec §3)
- **Canonical base URL:** `https://www.guriescapes.com`. (spec §8)
- **Follow existing patterns:** admin repeaters mirror the FAQ/metrics add-remove UI; upload/serve mirrors `/api/img/[id]` hardening. (spec §0.3)
- **Content version:** bump `CONTENT_VERSION` 2 → 3; migration runs exactly once. (spec §1)
- **Exact enquiry option copy** (spec §4):
  - help: `Send me the brochure and price list`, `Show me the projected rental returns`, `Explain the payment plan`, `Explain foreign ownership and legal structure`, `Help me compare Villa A and Villa B`, `I'm interested in purchasing both villas`, `Arrange a call or site visit`
  - timeframe: `Immediately`, `Within 1–3 months`, `Within 3–6 months`, `Within 6–12 months`, `Just researching`
- **TZ number:** `+255 799 109621` (call-only). **Developer:** Guri Build Zanzibar Ltd, 2 years, building on Guri Build Kenya. (brief #11, #2)

---

## File Structure

- `src/lib/content/defaults.js` — new default fields + corrected copy strings + exported `OLD_DEFAULTS` map for the migration to compare against.
- `src/lib/server/migrate.js` **(new)** — pure `computeSiteMigration(current, additions, corrections)` → `{ $set }` patch or `null`. No I/O. Unit-tested.
- `src/lib/server/migrate.test.js` **(new)** — `node:test` unit tests.
- `src/lib/server/content.js` — call `computeSiteMigration`, apply via `updateOne($set)`; stop villa field-overwrite; bump version to 3.
- `src/lib/server/db.js` — add `documents()` collection helper.
- `src/lib/server/email.js` — `attachments` support, `brochureEmail`, extra rows in `newEnquiryEmail`.
- `src/routes/api/upload/doc/+server.js` **(new)** — PDF upload (admin only).
- `src/routes/api/doc/[id]/+server.js` **(new)** — serve PDF hardened.
- `src/routes/api/enquire/+server.js` — store `help`/`timeframe`; brochure email.
- `src/lib/stores/enquiry.js` **(new)** — `brochureIntent` writable.
- `src/lib/components/EnquiryForm.svelte` — revamped fields, phone country code.
- `src/lib/components/Footer.svelte` — Legal links, TZ number, Calendly, WhatsApp note.
- `src/lib/seo.js` **(new)** — `buildSeo()` + JSON-LD builders.
- `src/routes/(public)/+layout.server.js` / `+layout.svelte` — pass + render `seo`.
- `src/routes/(public)/+page.server.js` / `+page.svelte` — `seo`, new sections, copy, JSON-LD, alt/lazy.
- `src/routes/(public)/[slug]/+page.server.js` / `+page.svelte` — `seo`, floor-plan slot, JSON-LD.
- `src/routes/(public)/privacy/+page.svelte`, `terms/+page.svelte` **(new)**.
- `src/routes/admin/content/+page.svelte` / `+page.server.js` — new editor sections + sanitizers + brochure uploader.
- `src/routes/admin/+page.svelte` / `+page.server.js` — show `help`/`timeframe`.

---

## Task 1: Non-destructive migration (pure function + tests)

**Files:**
- Create: `src/lib/server/migrate.js`
- Create: `src/lib/server/migrate.test.js`

**Interfaces:**
- Produces: `computeSiteMigration(current, additions, corrections)` → returns `{ $set: {...} }` with only the keys that should change, or `null` if nothing to change.
  - `current`: the stored `site` doc (object).
  - `additions`: flat map of `dottedPath → defaultValue` for **new** fields; included only if the path is absent in `current`.
  - `corrections`: array of `{ path, oldValue, newValue }`; included only if the value at `path` in `current` **deep-equals** `oldValue`.

- [ ] **Step 1: Write the failing test**

```js
// src/lib/server/migrate.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeSiteMigration, getPath, deepEqual } from './migrate.js';

test('adds only absent additions', () => {
  const current = { hero: { headline: 'Edited' }, contact: { email: 'a@b.com' } };
  const additions = { 'developer.heading': 'Dev', 'contact.calendly': '', 'hero.headline': 'X' };
  const patch = computeSiteMigration(current, additions, []);
  assert.deepEqual(patch, { $set: { 'developer.heading': 'Dev', 'contact.calendly': '' } });
});

test('applies a correction only when value still equals old default', () => {
  const current = { metrics: [{ cap: 'Projected land growth to 2026*' }, { cap: 'kept' }] };
  const corrections = [
    { path: 'metrics.0.cap', oldValue: 'Projected land growth to 2026*', newValue: 'Projected land growth to 2027*' },
    { path: 'metrics.1.cap', oldValue: 'was-something-else', newValue: 'should-not-apply' }
  ];
  const patch = computeSiteMigration(current, {}, corrections);
  assert.deepEqual(patch, { $set: { 'metrics.0.cap': 'Projected land growth to 2027*' } });
});

test('returns null when nothing changes', () => {
  const current = { developer: { heading: 'Dev' } };
  assert.equal(computeSiteMigration(current, { 'developer.heading': 'X' }, []), null);
});

test('getPath reads nested + array indices; deepEqual compares arrays', () => {
  assert.equal(getPath({ a: { b: [10, 20] } }, 'a.b.1'), 20);
  assert.equal(getPath({}, 'x.y'), undefined);
  assert.ok(deepEqual([1, { q: 'a' }], [1, { q: 'a' }]));
  assert.ok(!deepEqual([1], [2]));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/server/migrate.test.js`
Expected: FAIL — cannot find module `./migrate.js` / exports undefined.

- [ ] **Step 3: Write the implementation**

```js
// src/lib/server/migrate.js
// Pure helpers for a non-destructive one-time content migration.
// No database access here — callers apply the returned $set patch.

/** Read a dotted path (supports numeric array indices). undefined if missing. */
export function getPath(obj, path) {
  let cur = obj;
  for (const key of path.split('.')) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur;
}

/** Whether a dotted path resolves to something present (not undefined). */
export function hasPath(obj, path) {
  return getPath(obj, path) !== undefined;
}

/** Structural equality good enough for strings/arrays/plain objects. */
export function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

/**
 * Compute a non-destructive $set patch for the site document.
 *  - additions: { dottedPath: defaultValue } — added only if the path is absent.
 *  - corrections: [{ path, oldValue, newValue }] — applied only if current value
 *    still deep-equals oldValue (i.e. the field was never hand-edited).
 * Returns { $set } or null when there is nothing to change.
 */
export function computeSiteMigration(current, additions = {}, corrections = []) {
  const set = {};
  for (const [path, value] of Object.entries(additions)) {
    if (!hasPath(current, path)) set[path] = value;
  }
  for (const { path, oldValue, newValue } of corrections) {
    if (deepEqual(getPath(current, path), oldValue)) set[path] = newValue;
  }
  return Object.keys(set).length ? { $set: set } : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/server/migrate.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/migrate.js src/lib/server/migrate.test.js
git commit -m "Add pure non-destructive site-migration helper with tests"
```

---

## Task 2: New default content fields + old-defaults map

**Files:**
- Modify: `src/lib/content/defaults.js`

**Interfaces:**
- Produces: `defaultSiteContent` gains new optional fields (empty by default so nothing renders until filled), the developer copy (seeded non-empty), corrected metric caption; and a new export `MIGRATION` = `{ additions, corrections }` consumed by `content.js` (Task 3).

- [ ] **Step 1: Add new fields to `defaultSiteContent`**

In `src/lib/content/defaults.js`, inside `defaultSiteContent` add these keys (developer seeded with real copy; the rest empty so they stay hidden):

```js
  developer: {
    eyebrow: 'About the developer',
    heading: 'Built by Guri Build Zanzibar.',
    since: '2 years',
    body: [
      'Guri Build Zanzibar is the development company behind Guri Escapes Pongwe—a collection of private pool villas designed for island living and managed rental income.',
      'Building on the project-delivery experience of Guri Build Kenya, we manage the full development journey: land, design, approvals, construction, buyer reporting and handover. After completion, Guri Escapes manages reservations, guests, maintenance and owner returns.',
      'Our first two-bedroom villas in Pongwe are now available from USD 90,000.'
    ],
    image: ''
  },
  testimonials: [],
  trustBar: { zipa: '', remaxReportUrl: '', note: '', press: [] },
  renders: [],
  floorPlans: [],
  progress: [],
  availability: { reserved: '', total: '', note: '' },
  brochure: { fileUrl: '', name: '', uploadedAt: null },
```

Also add the new `contact` sub-keys (keep existing ones):

```js
  contact: {
    email: 'hello@guriescapes.com',
    phone: '+1 641 955 3743',
    phoneTz: '+255 799 109621',
    whatsapp: '16419553743',
    whatsappNote: 'International line — WhatsApp only',
    calendly: '',
    instagram: 'https://instagram.com/guriescapes',
    facebook: 'https://facebook.com/guriescapes'
  },
```

- [ ] **Step 2: Apply the corrected copy strings in defaults**

Update the stale metric caption and FAQ answers **in `defaultSiteContent`** to the corrected text (these are the fresh-DB defaults; existing DBs get them via migration in Task 8):

- `metrics[3].cap`: `'Projected land growth to 2026*'` → `'Projected land growth to 2027*'`
- FAQ "Can international buyers own property in Zanzibar?" answer → replace the residence-permit sentence with:
  > `Yes. Foreign buyers hold a long leasehold — up to 99 years (33-year renewable terms) — most straightforwardly inside government-approved (ZIPA) developments. A single villa at USD 90,000 is a leasehold purchase; the investment residence permit is a separate, optional route that requires a total qualifying investment from USD 100,000, which buyers typically reach by taking both villas or an upgraded, furnished package. We provide full legal and visa guidance for a smooth, compliant process.`
- FAQ "Does Pongwe offer long-term growth?" answer: change `appreciate 30–40% as new air routes` context year framing to `2027` where a year is implied (keep the sentence; no explicit 2026 exists here — leave as-is if none).
- FAQ "How does tourism support returns in Pongwe?" answer: `climbing toward 1 million arrivals by 2026` → `climbing past 1 million arrivals, with growth projected through 2027`.
- Add a new FAQ entry at the end (resale/exit, brief #10):
  ```js
  {
    q: 'Can I resell or exit my investment later?',
    a: 'Yes. Villas are transferable, and when you decide to exit we can help you sell or offload your investment to our ready pool of buyers — the same audience already drawn to Pongwe. As the managing operator we can market your villa with a proven income record, which supports resale value and liquidity.'
  }
  ```

- [ ] **Step 3: Export the migration map**

At the end of `defaults.js`, add:

```js
// One-time, non-destructive migration for already-seeded databases.
// additions: new fields, added only if absent. corrections: applied only if the
// stored value still equals oldValue (i.e. the field was never hand-edited).
export const MIGRATION = {
  additions: {
    'developer': defaultSiteContent.developer,
    'testimonials': [],
    'trustBar': { zipa: '', remaxReportUrl: '', note: '', press: [] },
    'renders': [],
    'floorPlans': [],
    'progress': [],
    'availability': { reserved: '', total: '', note: '' },
    'brochure': { fileUrl: '', name: '', uploadedAt: null },
    'contact.phoneTz': '+255 799 109621',
    'contact.whatsappNote': 'International line — WhatsApp only',
    'contact.calendly': ''
  },
  corrections: [
    {
      path: 'metrics.3.cap',
      oldValue: 'Projected land growth to 2026*',
      newValue: 'Projected land growth to 2027*'
    },
    {
      path: 'faq.0.a',
      oldValue: 'Yes. Foreign buyers hold a long leasehold, up to 99 years, broken down to 33 years renewable, most straightforwardly inside government-approved (ZIPA) developments. A qualifying purchase (from USD 100,000) can also support an investment residence permit. We provide full legal and visa guidance for a smooth, compliant process.',
      newValue: 'Yes. Foreign buyers hold a long leasehold — up to 99 years (33-year renewable terms) — most straightforwardly inside government-approved (ZIPA) developments. A single villa at USD 90,000 is a leasehold purchase; the investment residence permit is a separate, optional route that requires a total qualifying investment from USD 100,000, which buyers typically reach by taking both villas or an upgraded, furnished package. We provide full legal and visa guidance for a smooth, compliant process.'
    },
    {
      path: 'faq.2.a',
      oldValue: "Zanzibar's visitor numbers are climbing toward 1 million arrivals by 2026. Pongwe's calm, design-led east coast is exactly what today's premium traveller seeks, driving strong, year-round short-stay demand for private pool villas.",
      newValue: "Zanzibar's visitor numbers are climbing past 1 million arrivals, with growth projected through 2027. Pongwe's calm, design-led east coast is exactly what today's premium traveller seeks, driving strong, year-round short-stay demand for private pool villas."
    }
  ]
};
```

> Note: the resale FAQ is appended by the migration only if absent — handled in Task 8, not here, to keep it idempotent.

- [ ] **Step 4: Verify the module parses**

Run: `node -e "import('./src/lib/content/defaults.js').then(m=>console.log(Object.keys(m.MIGRATION.additions).length, m.MIGRATION.corrections.length))"`
Expected: prints `11 3`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/defaults.js
git commit -m "Seed new CMS fields, corrected copy, and migration map"
```

---

## Task 3: Wire the non-destructive migration into content sync

**Files:**
- Modify: `src/lib/server/content.js`
- Modify: `src/lib/server/db.js` (add `documents()`)

**Interfaces:**
- Consumes: `computeSiteMigration` (Task 1), `MIGRATION` (Task 2).
- Produces: `documents()` collection helper for Tasks 4–5.

- [ ] **Step 1: Add the `documents()` helper to `db.js`**

After the `images()` function in `src/lib/server/db.js`:

```js
export async function documents() {
  const db = await getDb();
  return db.collection('documents');
}
```

- [ ] **Step 2: Rewrite `ensureSeeded()` in `content.js` to be non-destructive**

Replace the body of `ensureSeeded()` so that, on an already-seeded DB, it applies the additive/conditional migration instead of `replaceOne`; on a fresh DB it seeds full defaults. New imports at top:

```js
import { computeSiteMigration } from './migrate';
import { defaultSiteContent, defaultVillas, MIGRATION } from '$lib/content/defaults';
```

Bump the version and replace the sync block:

```js
const CONTENT_VERSION = 3;
```

```js
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
      // Append resale FAQ once, only if absent.
      const hasResale = Array.isArray(existing.faq) &&
        existing.faq.some((f) => /resell|resale|exit/i.test(f?.q || ''));
      if (!hasResale) {
        await sc.updateOne(
          { _id: 'site' },
          { $push: { faq: {
            q: 'Can I resell or exit my investment later?',
            a: 'Yes. Villas are transferable, and when you decide to exit we can help you sell or offload your investment to our ready pool of buyers — the same audience already drawn to Pongwe. As the managing operator we can market your villa with a proven income record, which supports resale value and liquidity.'
          } } }
        );
      }
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
```

- [ ] **Step 3: Verify build/typecheck of the module graph**

Run: `npm run build`
Expected: build succeeds (no import errors). (This exercises `content.js`, `migrate.js`, `defaults.js` together.)

- [ ] **Step 4: Manual migration smoke against local Mongo (if available)**

If a local `mongod` is running, run this throwaway check (adjust URI); otherwise skip and rely on Task 1 unit tests:

```bash
node -e "
import('mongodb').then(async ({MongoClient})=>{
  const c = new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017');
  await c.connect(); const db=c.db('guriescapes_migtest');
  await db.collection('siteContent').deleteMany({});
  await db.collection('meta').deleteMany({});
  await db.collection('siteContent').insertOne({_id:'site',hero:{headline:'EDITED'},metrics:[{},{},{},{cap:'Projected land growth to 2026*'}],faq:[{q:'Can international buyers own property in Zanzibar?',a:'Yes. Foreign buyers hold a long leasehold, up to 99 years, broken down to 33 years renewable, most straightforwardly inside government-approved (ZIPA) developments. A qualifying purchase (from USD 100,000) can also support an investment residence permit. We provide full legal and visa guidance for a smooth, compliant process.'}]});
  const {computeSiteMigration}=await import('./src/lib/server/migrate.js');
  const {MIGRATION}=await import('./src/lib/content/defaults.js');
  const cur=await db.collection('siteContent').findOne({_id:'site'});
  const patch=computeSiteMigration(cur,MIGRATION.additions,MIGRATION.corrections);
  console.log('hero preserved:', cur.hero.headline==='EDITED');
  console.log('patch keys:', Object.keys(patch.\$set));
  await c.close();
});
"
```
Expected: `hero preserved: true`; patch keys include `developer`, `contact.phoneTz`, `metrics.3.cap`, `faq.0.a` (and NOT `hero.headline`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/content.js src/lib/server/db.js
git commit -m "Make content sync non-destructive; add documents collection"
```

---

## Task 4: PDF upload + serve endpoints

**Files:**
- Create: `src/routes/api/upload/doc/+server.js`
- Create: `src/routes/api/doc/[id]/+server.js`

**Interfaces:**
- Consumes: `documents()` (Task 3), `locals.admin` (existing auth).
- Produces: `POST /api/upload/doc` → `{ url: '/api/doc/<id>', name }`; `GET /api/doc/[id]` serves the PDF.

- [ ] **Step 1: Create the upload endpoint**

```js
// src/routes/api/upload/doc/+server.js
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
```

- [ ] **Step 2: Create the serve endpoint**

```js
// src/routes/api/doc/[id]/+server.js
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/routes/api/upload/doc/+server.js src/routes/api/doc/
git commit -m "Add hardened PDF upload and serve endpoints"
```

---

## Task 5: Email attachments + brochure email + enquiry storage

**Files:**
- Modify: `src/lib/server/email.js`
- Modify: `src/routes/api/enquire/+server.js`

**Interfaces:**
- Consumes: `documents()` (Task 3), `getSiteContent()`.
- Produces: `sendEmail({ ..., attachments })`; `brochureEmail(lead, site)`; enquiry doc gains `help: []`, `timeframe: ''`.

- [ ] **Step 1: Add `attachments` to `sendEmail` + `brochureEmail` template**

In `src/lib/server/email.js`, extend `sendEmail` signature and body:

```js
export async function sendEmail({ to, subject, html, replyTo, attachments }) {
  if (!env.RESEND_API_KEY) { console.warn('Email skipped: RESEND_API_KEY not set.'); return false; }
  if (!to) { console.warn('Email skipped: no recipient.'); return false; }
  const from = env.MAIL_FROM || 'Guri Escapes <onboarding@resend.dev>';
  const endpoint = env.RESEND_API_URL || 'https://api.resend.com/emails';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from, to, subject, html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments && attachments.length ? { attachments } : {})
      })
    });
    if (!res.ok) { console.error('Resend error', res.status, await res.text().catch(() => '')); return false; }
    return true;
  } catch (e) { console.error('Email send failed:', e); return false; }
}
```

Add the brochure template (uses existing `esc`):

```js
export function brochureEmail(lead, hasPdf, contact = {}) {
  const name = esc(lead.firstname || 'there');
  const lead_in = hasPdf
    ? 'Your Guri Escapes Pongwe brochure and price list are attached to this email.'
    : "Thanks for your interest — we're preparing the latest brochure and price list and will email it to you very shortly.";
  const wa = contact.whatsapp ? `https://wa.me/${esc(contact.whatsapp)}` : '';
  return `<div style="background:#FCF8EF;padding:24px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7e0d3;border-radius:14px;overflow:hidden">
    <div style="background:#363a17;color:#FCF8EF;padding:18px 22px;font-size:18px;font-weight:600">Guri Escapes Pongwe</div>
    <div style="padding:22px;color:#2b2e18;font-size:15px;line-height:1.6">
      <p>Hi ${name},</p>
      <p>${lead_in}</p>
      <p>Two design-led private pool villas on Zanzibar's calm east coast — fully managed for hands-off rental income, from USD 90,000.</p>
      ${contact.email ? `<p>Questions? Reply to this email${wa ? ` or message us on <a href="${wa}" style="color:#BE8F5B">WhatsApp</a>` : ''}.</p>` : ''}
      <p style="margin-top:22px;color:#5a5c45">— The Guri Escapes team</p>
    </div>
  </div>
</div>`;
}
```

- [ ] **Step 2: Add help/timeframe rows to the team notification**

In `newEnquiryEmail`, extend the rows array (after `Interested in`):

```js
      ['Interested in', lead.interest],
      ['How we can help', Array.isArray(lead.help) ? lead.help.join(', ') : lead.help],
      ['Timeframe', lead.timeframe],
```

- [ ] **Step 3: Store help/timeframe + send brochure in the enquiry API**

In `src/routes/api/enquire/+server.js`, add imports and fields. New imports:

```js
import { enquiries, documents } from '$lib/server/db';
import { sendEmail, notifyAddress, newEnquiryEmail, brochureEmail } from '$lib/server/email';
import { getSiteContent } from '$lib/server/content';
import { ObjectId } from 'mongodb';
```

Parse help (array) and timeframe, add to `doc`:

```js
  const helpRaw = Array.isArray(body.help) ? body.help : (body.help ? [body.help] : []);
  const help = helpRaw.map((h) => str(h, 120)).filter(Boolean).slice(0, 12);
  const timeframe = str(body.timeframe, 60);
```
```js
  const doc = {
    firstname, lastname, email,
    phone: str(body.phone, 60),
    interest: str(body.interest, 120),
    help,
    timeframe,
    message: str(body.message, 4000),
    source: str(body.source, 40),
    createdAt: new Date(),
    status: 'New', notes: '', nextStep: '', nextStepDate: null, updatedAt: null
  };
```

After the team-notify block, add a second best-effort block that emails the enquirer the brochure when requested:

```js
  // Brochure to the enquirer (best-effort).
  try {
    const wantsBrochure = doc.source === 'brochure' ||
      doc.help.some((h) => /brochure/i.test(h)) || /brochure/i.test(doc.interest);
    if (wantsBrochure) {
      const site = await getSiteContent();
      const b = site?.brochure || {};
      let attachments;
      if (b.fileUrl) {
        const m = /\/api\/doc\/([a-f0-9]{24})/.exec(b.fileUrl);
        if (m) {
          const col = await documents();
          const fileDoc = await col.findOne({ _id: new ObjectId(m[1]) });
          if (fileDoc?.data) {
            const bin = fileDoc.data;
            const bytes = bin && bin.buffer ? Buffer.from(bin.buffer) : Buffer.from(bin);
            attachments = [{ filename: fileDoc.name || 'Guri-Escapes-Pongwe.pdf', content: bytes.toString('base64') }];
          }
        }
      }
      await sendEmail({
        to: doc.email,
        subject: 'Your Guri Escapes Pongwe brochure',
        html: brochureEmail(doc, !!attachments, site?.contact || {}),
        attachments
      });
    }
  } catch (e) {
    console.error('Brochure email failed:', e);
  }
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/email.js src/routes/api/enquire/+server.js
git commit -m "Email brochure to enquirer on submit; store help/timeframe"
```

---

## Task 6: Enquiry form revamp + phone country code + brochure intent

**Files:**
- Create: `src/lib/stores/enquiry.js`
- Modify: `src/lib/components/EnquiryForm.svelte`
- Modify: `src/routes/(public)/+page.svelte` (brochure buttons)

**Interfaces:**
- Consumes: `brochureIntent` store.
- Produces: form POSTs `help` (array), `timeframe`, combined `phone`.

- [ ] **Step 1: Create the store**

```js
// src/lib/stores/enquiry.js
import { writable } from 'svelte/store';
// Set true when a "Download brochure" CTA is clicked so the enquiry form
// pre-selects the brochure option.
export const brochureIntent = writable(false);
```

- [ ] **Step 2: Rewrite `EnquiryForm.svelte`**

Replace the component with (keeps existing styling classes; adds new fields):

```svelte
<script>
  import { brochureIntent } from '$lib/stores/enquiry';
  export let source = 'home';
  export let preselectHelp = []; // extra help options to pre-check (e.g. compare villas)

  const HELP_OPTIONS = [
    'Send me the brochure and price list',
    'Show me the projected rental returns',
    'Explain the payment plan',
    'Explain foreign ownership and legal structure',
    'Help me compare Villa A and Villa B',
    "I'm interested in purchasing both villas",
    'Arrange a call or site visit'
  ];
  const TIMEFRAMES = ['Immediately', 'Within 1–3 months', 'Within 3–6 months', 'Within 6–12 months', 'Just researching'];
  const DIAL_CODES = [
    { c: 'Tanzania', d: '+255' }, { c: 'Kenya', d: '+254' }, { c: 'Uganda', d: '+256' },
    { c: 'United Kingdom', d: '+44' }, { c: 'United States / Canada', d: '+1' }, { c: 'UAE', d: '+971' },
    { c: 'South Africa', d: '+27' }, { c: 'Germany', d: '+49' }, { c: 'Italy', d: '+39' },
    { c: 'France', d: '+33' }, { c: 'Netherlands', d: '+31' }, { c: 'Switzerland', d: '+41' }, { c: 'Other', d: '+' }
  ];

  let form;
  let status = 'idle';
  let selectedHelp = new Set(preselectHelp);
  let dialCode = '+255';
  let phoneNumber = '';
  let timeframe = '';

  // Pre-check brochure option when arriving via a Download-brochure CTA.
  $: if ($brochureIntent) selectedHelp = new Set([...selectedHelp, 'Send me the brochure and price list']);

  function toggleHelp(opt) {
    const next = new Set(selectedHelp);
    next.has(opt) ? next.delete(opt) : next.add(opt);
    selectedHelp = next;
  }

  async function submit(e) {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    status = 'sending';
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.source = source;
    data.help = [...selectedHelp];
    data.timeframe = timeframe;
    data.phone = phoneNumber.trim() ? `${dialCode} ${phoneNumber.trim()}` : '';
    delete data.phoneNumber; delete data.dialCode;
    try {
      const res = await fetch('/api/enquire', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('failed');
      status = 'sent';
      form.reset(); selectedHelp = new Set(); phoneNumber = ''; timeframe = ''; dialCode = '+255';
      brochureIntent.set(false);
      setTimeout(() => (status = 'idle'), 3500);
    } catch {
      status = 'error';
      setTimeout(() => (status = 'idle'), 4000);
    }
  }
</script>

<form bind:this={form} on:submit={submit}>
  <div class="field"><label for="fn">First name</label><input id="fn" name="firstname" required placeholder="Jane" /></div>
  <div class="field"><label for="ln">Last name</label><input id="ln" name="lastname" required placeholder="Doe" /></div>
  <div class="field"><label for="em">Email</label><input id="em" type="email" name="email" required placeholder="you@email.com" /></div>
  <div class="field full">
    <label for="ph">Phone</label>
    <div class="phone-row">
      <select bind:value={dialCode} aria-label="Country dial code">
        {#each DIAL_CODES as x}<option value={x.d}>{x.c} ({x.d})</option>{/each}
      </select>
      <input id="ph" inputmode="tel" bind:value={phoneNumber} placeholder="712 345 678" />
    </div>
  </div>
  <fieldset class="field full help-set">
    <legend>How can we help?</legend>
    {#each HELP_OPTIONS as opt}
      <label class="chk"><input type="checkbox" checked={selectedHelp.has(opt)} on:change={() => toggleHelp(opt)} /> <span>{opt}</span></label>
    {/each}
  </fieldset>
  <div class="field full">
    <label for="tf">When are you considering purchasing?</label>
    <select id="tf" bind:value={timeframe}>
      <option value="" disabled selected>Select…</option>
      {#each TIMEFRAMES as t}<option value={t}>{t}</option>{/each}
    </select>
  </div>
  <div class="field full"><label for="ms">Message (optional)</label><textarea id="ms" name="message" rows="3" placeholder="Anything else we should know?"></textarea></div>
  <button type="submit" class="btn btn-primary btn-lg full" style="justify-content:center"
    style:background={status === 'sent' ? 'var(--gold)' : ''}
    disabled={status === 'sending' || status === 'sent'}>
    {#if status === 'sent'}Thank you — we'll be in touch ✓
    {:else if status === 'sending'}Sending…
    {:else if status === 'error'}Something went wrong — try again
    {:else}Send enquiry <span class="arrow">→</span>{/if}
  </button>
  <p class="form-note">By enquiring you agree to be contacted about Guri Escapes Pongwe. See our <a href="/privacy">Privacy Policy</a>. We never share your details.</p>
</form>

<style>
  .phone-row { display: grid; grid-template-columns: minmax(0, 44%) 1fr; gap: 0.5rem; }
  .phone-row select { min-width: 0; }
  .help-set { border: 0; padding: 0; margin: 0; }
  .help-set legend { padding: 0; font: inherit; margin-bottom: 0.5rem; }
  .chk { display: flex; align-items: flex-start; gap: 0.55rem; padding: 0.35rem 0; cursor: pointer; font-size: 0.95rem; }
  .chk input { margin-top: 0.2rem; flex: none; }
</style>
```

> Field label/input styles are inherited from the global form styles in `app.css` (the parent `.enquire` section). The `<style>` block only adds the new phone-row/checkbox layout.

- [ ] **Step 3: Update callers**

In `src/routes/(public)/+page.svelte`: remove the old `interestOptions`/`defaultInterest` props and render `<EnquiryForm source="home" />`. Wire the two "Download brochure" buttons: add `import { brochureIntent } from '$lib/stores/enquiry';` and change both brochure buttons to `<a href="#enquire" on:click={() => brochureIntent.set(true)} class="btn btn-ghost btn-lg on-dark">Download brochure</a>`.

In `src/routes/(public)/[slug]/+page.svelte`: change the form to `<EnquiryForm source={v.slug} preselectHelp={['Help me compare Villa A and Villa B']} />`.

- [ ] **Step 4: Verify build + manual smoke**

Run: `npm run build`
Expected: success. Then `npm run dev`, open `/`, click "Download brochure" → scrolls to form with the brochure checkbox pre-checked; submit → success state (email requires RESEND).

- [ ] **Step 5: Commit**

```bash
git add src/lib/stores/enquiry.js src/lib/components/EnquiryForm.svelte "src/routes/(public)/+page.svelte" "src/routes/(public)/[slug]/+page.svelte"
git commit -m "Revamp enquiry form: help options, timeframe, phone country code, brochure intent"
```

---

## Task 7: Show help/timeframe on admin leads

**Files:**
- Modify: `src/routes/admin/+page.server.js`
- Modify: `src/routes/admin/+page.svelte`

**Interfaces:**
- Consumes: enquiry docs with `help`/`timeframe` (Task 5).

- [ ] **Step 1: Serialize the new fields**

In `src/routes/admin/+page.server.js`, wherever an enquiry is mapped for the client, include `help: Array.isArray(e.help) ? e.help : []` and `timeframe: e.timeframe || ''`. (Find the `.map(` that builds the `enquiries` array returned from `load`; add the two properties.)

- [ ] **Step 2: Render in the drawer**

In `src/routes/admin/+page.svelte`, in the drawer body after the `d-tags` block, add:

```svelte
          {#if selected.help && selected.help.length}
            <div class="d-block"><span class="d-label">How we can help</span>
              <div class="d-tags">{#each selected.help as h}<span class="tag interest">{h}</span>{/each}</div>
            </div>
          {/if}
          {#if selected.timeframe}
            <div class="d-block"><span class="d-label">Timeframe</span><p>{selected.timeframe}</p></div>
          {/if}
```

Also, in the leads table "Interest" cell, fall back to help/timeframe when `interest` is empty:

```svelte
                  <td class="col-interest td-soft">{e.interest || (e.help && e.help[0]) || e.timeframe || '—'}</td>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/routes/admin/+page.server.js src/routes/admin/+page.svelte
git commit -m "Surface help options and timeframe on admin leads"
```

---

## Task 8: Copy corrections on the hardcoded invest stats

**Files:**
- Modify: `src/routes/(public)/+page.svelte`

> The CMS-stored copy fixes (#5 metric caption, #6 FAQ, #10 resale FAQ) are handled by Tasks 2–3 (defaults + migration). This task fixes the **hardcoded** invest-stat block that isn't in the CMS.

**Interfaces:** none.

- [ ] **Step 1: Reframe the stale invest stat**

In `src/routes/(public)/+page.svelte`, in the `07 · WHY INVEST` section:
- Change `<div class="cap">Projected land appreciation to 2026.</div>` → `Projected land appreciation to 2027.`
- Change the invest-note `Tourist arrivals are on track to surpass 1 million by 2026 — and villas earn in USD...` → `Tourist arrivals have passed 1 million and continue to climb through 2027 — and villas earn in USD, a natural hedge against currency movement.`

- [ ] **Step 2: Verify build + visual check**

Run: `npm run build`; `npm run dev` and confirm the "Why invest" section reads 2027 and no "by 2026".

- [ ] **Step 3: Commit**

```bash
git add "src/routes/(public)/+page.svelte"
git commit -m "Reframe stale 2026 dates in invest section to 2027"
```

---

## Task 9: New home sections (developer, renders, floor plans, progress, trust/testimonials, scarcity)

**Files:**
- Modify: `src/routes/(public)/+page.svelte`

**Interfaces:**
- Consumes: `data.site.developer`, `.renders`, `.floorPlans`, `.progress`, `.trustBar`, `.testimonials`, `.availability` (from `getSiteContent`, already passed to the page via `+page.server.js` → confirm `data.site` includes them; `getSiteContent` returns the whole doc so they're present).

- [ ] **Step 1: Add reactive derived vars**

In the `<script>` of `+page.svelte`, after existing `$:` lines, add:

```js
  $: developer = data.site.developer || {};
  $: renders = data.site.renders || [];
  $: floorPlans = data.site.floorPlans || [];
  $: progress = data.site.progress || [];
  $: trustBar = data.site.trustBar || {};
  $: testimonials = data.site.testimonials || [];
  $: availability = data.site.availability || {};
  $: hasTrust = trustBar.zipa || trustBar.remaxReportUrl || (trustBar.press && trustBar.press.length);
```

Add `import Gallery from '$lib/components/Gallery.svelte';` at the top.

- [ ] **Step 2: About the developer (after the Managed model section, `#managed`)**

```svelte
{#if developer.heading}
<section class="section-pad" id="developer">
  <div class="wrap split">
    <div class="reveal">
      <p class="eyebrow">{developer.eyebrow || 'About the developer'}</p>
      <h2>{developer.heading}</h2>
      {#each developer.body || [] as para, i}
        <p class={i === 0 ? 'lede' : ''} style={i === 0 ? 'margin-top:1.4rem' : ''}>{para}</p>
      {/each}
      {#if developer.since}<p class="dev-since"><b>{developer.since}</b> delivering projects · Guri Build Zanzibar Ltd</p>{/if}
    </div>
    {#if developer.image}
      <div class="split-media reveal" data-d="1"><img src={developer.image} alt="Guri Build Zanzibar project" loading="lazy" decoding="async" /></div>
    {/if}
  </div>
</section>
{/if}
```

Add to the page `<style>` (or inline): `.dev-since { margin-top: 1.4rem; color: var(--ink-soft); font-size: .9rem; }`

- [ ] **Step 3: Renders + floor plans + construction progress (after `#inside` or before `#features`)**

```svelte
{#if renders.length}
<section class="section-pad" id="renders">
  <div class="wrap">
    <div class="reveal" style="max-width:560px"><p class="eyebrow">Architectural renders</p><h2>A look at the design.</h2></div>
    <Gallery images={renders} />
  </div>
</section>
{/if}

{#if floorPlans.length}
<section class="section-pad" id="floorplans" style="background:var(--sand)">
  <div class="wrap">
    <div class="reveal" style="max-width:560px"><p class="eyebrow">Floor plans</p><h2>Every square metre, considered.</h2></div>
    <div class="plan-grid reveal">
      {#each floorPlans as p}
        <figure class="plan"><img src={p.src} alt={p.alt || 'Villa floor plan'} loading="lazy" decoding="async" />{#if p.caption}<figcaption>{p.caption}</figcaption>{/if}</figure>
      {/each}
    </div>
  </div>
</section>
{/if}

{#if progress.length}
<section class="section-pad" id="progress">
  <div class="wrap">
    <div class="reveal" style="max-width:560px"><p class="eyebrow">Construction progress</p><h2>Watch it take shape.</h2></div>
    <div class="prog-grid reveal">
      {#each progress as p}
        <figure class="prog"><img src={p.src} alt={p.alt || 'Construction progress'} loading="lazy" decoding="async" /><figcaption>{p.date ? p.date + ' · ' : ''}{p.caption || ''}</figcaption></figure>
      {/each}
    </div>
  </div>
</section>
{/if}
```

Page styles:
```css
.plan-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem; margin-top: 2rem; }
.plan img, .prog img { width: 100%; height: auto; border-radius: 12px; display: block; }
.plan figcaption, .prog figcaption { margin-top: .6rem; font-size: .85rem; color: var(--ink-soft); }
.prog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 2rem; }
```

- [ ] **Step 4: Trust bar + testimonials (before the FAQ section)**

```svelte
{#if hasTrust || testimonials.length}
<section class="section-pad" id="trust" style="background:var(--sand)">
  <div class="wrap">
    {#if hasTrust}
      <div class="trust-bar reveal">
        {#if trustBar.zipa}<div class="trust-item"><span class="ti-k">ZIPA registered</span><span class="ti-v">{trustBar.zipa}</span></div>{/if}
        {#if trustBar.remaxReportUrl}<div class="trust-item"><a href={trustBar.remaxReportUrl} target="_blank" rel="noopener">RE/MAX Tanzania market report ↗</a></div>{/if}
        {#each trustBar.press || [] as pr}<div class="trust-item"><a href={pr.url} target="_blank" rel="noopener">{pr.label} ↗</a></div>{/each}
      </div>
      {#if trustBar.note}<p class="trust-note">{trustBar.note}</p>{/if}
    {/if}
    {#if testimonials.length}
      <div class="tst-grid reveal">
        {#each testimonials as t}
          <figure class="tst"><blockquote>“{t.quote}”</blockquote><figcaption>{t.name}{t.role ? `, ${t.role}` : ''}</figcaption></figure>
        {/each}
      </div>
    {/if}
  </div>
</section>
{/if}
```

Page styles:
```css
.trust-bar { display: flex; flex-wrap: wrap; gap: 1rem 2.4rem; align-items: center; justify-content: center; padding: 1.4rem 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.trust-item { font-size: .9rem; color: var(--ink); } .trust-item a { color: var(--wood); text-decoration: none; }
.ti-k { display:block; font-size:.66rem; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-soft); }
.trust-note { text-align:center; color:var(--ink-soft); font-size:.85rem; margin-top:1rem; }
.tst-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.4rem; margin-top:2.4rem; }
.tst { margin:0; background:#fff; border:1px solid var(--line); border-radius:14px; padding:1.6rem; }
.tst blockquote { margin:0 0 1rem; font-family:var(--f-display); font-size:1.15rem; line-height:1.5; color:var(--ink); }
.tst figcaption { font-size:.85rem; color:var(--ink-soft); }
```

- [ ] **Step 5: Scarcity indicator on the villas section**

In the `04 · AVAILABLE VILLAS` section, under the intro `<p class="lede">`, add:

```svelte
      {#if availability.total}
        <p class="avail reveal"><span class="avail-dot"></span>{availability.reserved || 0} of {availability.total} villas reserved{availability.note ? ` · ${availability.note}` : ''}</p>
      {/if}
```

Page style:
```css
.avail { display:inline-flex; align-items:center; gap:.5rem; margin-top:1.2rem; font-size:.9rem; color:var(--wood); font-weight:500; }
.avail-dot { width:8px; height:8px; border-radius:50%; background:var(--gold); box-shadow:0 0 0 4px rgba(190,143,91,.2); }
```

- [ ] **Step 6: Verify build + empty-state check**

Run: `npm run build`; `npm run dev`. With DB still on defaults (developer seeded, others empty): confirm the **Developer** section renders, and renders/floorplans/progress/trust/testimonials/scarcity are **absent** (no broken images). Add a temporary test value via `/admin/content` after Task 10 to confirm they appear.

- [ ] **Step 7: Commit**

```bash
git add "src/routes/(public)/+page.svelte"
git commit -m "Add developer, renders, floor plans, progress, trust, testimonials, scarcity sections"
```

---

## Task 10: Admin content editor — new sections + brochure uploader

**Files:**
- Modify: `src/routes/admin/content/+page.svelte`
- Modify: `src/routes/admin/content/+page.server.js`

**Interfaces:**
- Consumes: `/api/upload` (images), `/api/upload/doc` (PDF, Task 4).
- Produces: persists developer/testimonials/trustBar/renders/floorPlans/progress/availability/brochure/new-contact into `site`.

- [ ] **Step 1: Load the new fields**

In `+page.server.js` `load`, extend the returned object:

```js
  return {
    hero: site.hero, metrics: site.metrics, contact: site.contact, faq: site.faq,
    developer: site.developer || { eyebrow:'', heading:'', since:'', body:[], image:'' },
    testimonials: site.testimonials || [],
    trustBar: site.trustBar || { zipa:'', remaxReportUrl:'', note:'', press:[] },
    renders: site.renders || [], floorPlans: site.floorPlans || [], progress: site.progress || [],
    availability: site.availability || { reserved:'', total:'', note:'' },
    brochure: site.brochure || { fileUrl:'', name:'', uploadedAt:null }
  };
```

- [ ] **Step 2: Extend the save action sanitizer**

In the `actions.default`, extend `doc` with sanitized new fields (arrays capped). Add helper `arr = (v) => Array.isArray(v) ? v : []`:

```js
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
```

- [ ] **Step 3: Add editor UI sections**

In `+page.svelte` `<script>`, mirror the existing pattern: add bind vars and include the new fields in the `payload`:

```js
  let developer = { eyebrow:'', heading:'', since:'', body:[], image:'', ...data.developer };
  let testimonials = (data.testimonials || []).map((t) => ({ ...t }));
  let trustBar = { zipa:'', remaxReportUrl:'', note:'', press:[], ...data.trustBar };
  let renders = (data.renders || []).map((x) => ({ ...x }));
  let floorPlans = (data.floorPlans || []).map((x) => ({ ...x }));
  let progress = (data.progress || []).map((x) => ({ ...x }));
  let availability = { reserved:'', total:'', note:'', ...data.availability };
  let brochure = { fileUrl:'', name:'', uploadedAt:null, ...data.brochure };
  let uploadingDoc = false;

  const addItem = (a) => [...a, {}];
  const rmItem = (a, i) => a.filter((_, x) => x !== i);

  async function uploadImage(ev, target, i, key = 'src') {
    const file = ev.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (res.ok) { const { url } = await res.json(); target[i][key] = url; target = target; }
    else alert('Image upload failed');
  }
  async function uploadBrochure(ev) {
    const file = ev.target.files?.[0]; if (!file) return;
    uploadingDoc = true;
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload/doc', { method: 'POST', body: fd });
    uploadingDoc = false;
    if (res.ok) { const { url, name } = await res.json(); brochure = { fileUrl: url, name, uploadedAt: new Date().toISOString() }; }
    else alert('PDF upload failed');
  }
```

Update `payload` in `onSubmit`:

```js
    payload = JSON.stringify({ hero, contact, metrics, faq, developer, testimonials, trustBar, renders, floorPlans, progress, availability, brochure });
```

Add these `<section class="adm-section">` blocks inside the form (after Contact). Example for the brochure + a repeatable image gallery (renders); floorPlans/progress follow the same repeater with an extra caption/date field; testimonials/trustBar/developer are plain text repeaters:

```svelte
<section class="adm-section">
  <h2>Brochure (PDF)</h2>
  {#if brochure.fileUrl}<p><a href={brochure.fileUrl} target="_blank" rel="noopener">{brochure.name || 'Current brochure'} ↗</a></p>{/if}
  <label>Upload / replace brochure PDF <input type="file" accept="application/pdf" on:change={uploadBrochure} /></label>
  {#if uploadingDoc}<span>Uploading…</span>{/if}
</section>

<section class="adm-section">
  <h2>About the developer</h2>
  <div class="adm-field"><label>Eyebrow</label><input bind:value={developer.eyebrow} /></div>
  <div class="adm-field"><label>Heading</label><input bind:value={developer.heading} /></div>
  <div class="adm-field"><label>Years operating (e.g. “2 years”)</label><input bind:value={developer.since} /></div>
  {#each developer.body as _, i}
    <div class="adm-field"><label>Paragraph {i + 1}</label><textarea rows="3" bind:value={developer.body[i]}></textarea></div>
  {/each}
  <button type="button" class="adm-btn ghost sm" on:click={() => (developer.body = [...developer.body, ''])}>+ Paragraph</button>
  <div class="adm-field"><label>Image URL (optional)</label><input bind:value={developer.image} /><input type="file" accept="image/*" on:change={(e)=>uploadImage(e,[developer],0,'image').then(()=>developer=developer)} /></div>
</section>

<section class="adm-section">
  <h2>Architectural renders</h2>
  {#each renders as r, i}
    <div class="adm-repeat">
      <div class="adm-field"><label>Image</label><input bind:value={r.src} placeholder="/api/img/…" /><input type="file" accept="image/*" on:change={(e)=>uploadImage(e,renders,i)} /></div>
      <div class="adm-field"><label>Alt text</label><input bind:value={r.alt} /></div>
      <div class="adm-field"><label>Caption</label><input bind:value={r.caption} /></div>
      <button type="button" class="adm-del" on:click={() => (renders = rmItem(renders, i))}>Remove</button>
    </div>
  {/each}
  <button type="button" class="adm-btn ghost sm" on:click={() => (renders = addItem(renders))}>+ Add render</button>
</section>

<section class="adm-section">
  <h2>Floor plans</h2>
  {#each floorPlans as r, i}
    <div class="adm-repeat">
      <div class="adm-field"><label>Image</label><input bind:value={r.src} /><input type="file" accept="image/*" on:change={(e)=>uploadImage(e,floorPlans,i)} /></div>
      <div class="adm-field"><label>Alt text</label><input bind:value={r.alt} /></div>
      <div class="adm-field"><label>Caption</label><input bind:value={r.caption} /></div>
      <button type="button" class="adm-del" on:click={() => (floorPlans = rmItem(floorPlans, i))}>Remove</button>
    </div>
  {/each}
  <button type="button" class="adm-btn ghost sm" on:click={() => (floorPlans = addItem(floorPlans))}>+ Add floor plan</button>
</section>

<section class="adm-section">
  <h2>Construction progress</h2>
  {#each progress as r, i}
    <div class="adm-repeat">
      <div class="adm-field"><label>Image</label><input bind:value={r.src} /><input type="file" accept="image/*" on:change={(e)=>uploadImage(e,progress,i)} /></div>
      <div class="adm-field"><label>Alt text</label><input bind:value={r.alt} /></div>
      <div class="adm-row"><div class="adm-field"><label>Date label</label><input bind:value={r.date} placeholder="Jul 2026" /></div><div class="adm-field"><label>Caption</label><input bind:value={r.caption} /></div></div>
      <button type="button" class="adm-del" on:click={() => (progress = rmItem(progress, i))}>Remove</button>
    </div>
  {/each}
  <button type="button" class="adm-btn ghost sm" on:click={() => (progress = addItem(progress))}>+ Add photo</button>
</section>

<section class="adm-section">
  <h2>Trust bar</h2>
  <div class="adm-field"><label>ZIPA registration reference</label><input bind:value={trustBar.zipa} /></div>
  <div class="adm-field"><label>RE/MAX report URL</label><input bind:value={trustBar.remaxReportUrl} /></div>
  <div class="adm-field"><label>Note</label><input bind:value={trustBar.note} /></div>
  {#each trustBar.press as pr, i}
    <div class="adm-repeat"><div class="adm-row"><div class="adm-field"><label>Press label</label><input bind:value={pr.label} /></div><div class="adm-field"><label>URL</label><input bind:value={pr.url} /></div></div><button type="button" class="adm-del" on:click={() => (trustBar.press = rmItem(trustBar.press, i))}>Remove</button></div>
  {/each}
  <button type="button" class="adm-btn ghost sm" on:click={() => (trustBar.press = [...trustBar.press, {}])}>+ Add press link</button>
</section>

<section class="adm-section">
  <h2>Testimonials</h2>
  {#each testimonials as t, i}
    <div class="adm-repeat"><div class="adm-field"><label>Quote</label><textarea rows="2" bind:value={t.quote}></textarea></div><div class="adm-row"><div class="adm-field"><label>Name</label><input bind:value={t.name} /></div><div class="adm-field"><label>Role</label><input bind:value={t.role} /></div></div><button type="button" class="adm-del" on:click={() => (testimonials = rmItem(testimonials, i))}>Remove</button></div>
  {/each}
  <button type="button" class="adm-btn ghost sm" on:click={() => (testimonials = [...testimonials, {}])}>+ Add testimonial</button>
</section>

<section class="adm-section">
  <h2>Availability (scarcity)</h2>
  <div class="adm-row"><div class="adm-field"><label>Reserved</label><input bind:value={availability.reserved} placeholder="1" /></div><div class="adm-field"><label>Total</label><input bind:value={availability.total} placeholder="2" /></div></div>
  <div class="adm-field"><label>Note</label><input bind:value={availability.note} placeholder="e.g. Villa A reserved" /></div>
  <p style="font-size:.8rem;color:#8a8577">Leave “Total” blank to hide the reservation indicator entirely.</p>
</section>

<section class="adm-section">
  <h2>Contact — extra</h2>
  <div class="adm-row"><div class="adm-field"><label>Tanzania phone (call only)</label><input bind:value={contact.phoneTz} /></div><div class="adm-field"><label>WhatsApp note</label><input bind:value={contact.whatsappNote} /></div></div>
  <div class="adm-field"><label>Calendly URL (Book a call)</label><input bind:value={contact.calendly} /></div>
</section>
```

- [ ] **Step 4: Verify build + round-trip**

Run: `npm run build`; `npm run dev`; at `/admin/content` add a testimonial + availability total=2 reserved=1, save, then confirm on `/` the testimonial + "1 of 2 villas reserved" now show.

- [ ] **Step 5: Commit**

```bash
git add src/routes/admin/content/
git commit -m "Admin: edit developer, media, trust, testimonials, availability, brochure, contact"
```

---

## Task 11: Contact/compliance in footer + enquiry contact line

**Files:**
- Modify: `src/lib/components/Footer.svelte`
- Modify: `src/routes/(public)/+page.svelte` (enquiry contact-line)

**Interfaces:**
- Consumes: `contact.phoneTz`, `.calendly`, `.whatsappNote`.

- [ ] **Step 1: Footer — TZ number, WhatsApp note, Calendly, Legal links**

In `Footer.svelte`, in the "Get in touch" nav, after the existing phone link add:

```svelte
          {#if c.phoneTz}<a href={`tel:${c.phoneTz.replace(/\s/g, '')}`}>{c.phoneTz} · Call only</a>{/if}
          {#if c.calendly}<a href={c.calendly} target="_blank" rel="noopener">Book a call ↗</a>{/if}
```

Change the WhatsApp link text to include the note:

```svelte
          <a href={wa}>WhatsApp{c.whatsappNote ? ` · ${c.whatsappNote}` : ' · start chat'}</a>
```

Add a Legal group column (new `<div>` in `.footer-top`):

```svelte
      <div>
        <h4>Legal</h4>
        <nav class="footer-links" aria-label="Legal">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms &amp; Conditions</a>
        </nav>
      </div>
```

- [ ] **Step 2: Enquiry contact line — TZ number + Book a call**

In `+page.svelte` `#enquire` `.contact-line`, after the `tel:` phone link add:

```svelte
        {#if contact.phoneTz}<a href={`tel:${contact.phoneTz.replace(/\s/g,'')}`}><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg> {contact.phoneTz} · Call only</a>{/if}
        {#if contact.calendly}<a href={contact.calendly} target="_blank" rel="noopener"><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg> Book a call ↗</a>{/if}
```

Update the WhatsApp anchor label in the contact-line to append `{contact.whatsappNote}` if present.

- [ ] **Step 3: Verify build + visual**

Run: `npm run build`; confirm footer shows Legal column + TZ number, enquiry section shows the TZ call line (Calendly/Book-a-call appear only once a URL is set in admin).

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/Footer.svelte "src/routes/(public)/+page.svelte"
git commit -m "Add TZ call number, WhatsApp note, Calendly and Legal links to contact areas"
```

---

## Task 12: Privacy Policy + Terms pages

**Files:**
- Create: `src/routes/(public)/privacy/+page.svelte`
- Create: `src/routes/(public)/terms/+page.svelte`

**Interfaces:** none (static content pages under the public layout).

- [ ] **Step 1: Create the Privacy page**

```svelte
<!-- src/routes/(public)/privacy/+page.svelte -->
<svelte:head>
  <title>Privacy Policy — Guri Escapes Pongwe</title>
  <meta name="description" content="How Guri Build Zanzibar Ltd collects and uses your information when you enquire about Guri Escapes Pongwe." />
</svelte:head>
<section class="page-hero legal-hero"><div class="wrap ph-inner"><p class="crumb"><a href="/">Home</a> / Privacy</p><h1>Privacy Policy</h1></div></section>
<section class="section-pad"><div class="wrap legal-body">
  <p class="lede">This policy explains how Guri Build Zanzibar Ltd (“we”, “Guri Escapes”) handles personal information collected through this website. Last updated 19 July 2026.</p>
  <h2>What we collect</h2>
  <p>When you submit an enquiry we collect the name, email address, phone number, the options you select (how we can help, purchase timeframe) and any message you provide.</p>
  <h2>How we use it</h2>
  <p>We use your details only to respond to your enquiry, send the brochure and pricing you request, and follow up about Guri Escapes Pongwe. We also keep anonymous page-view counts to understand which pages are useful.</p>
  <h2>Sharing</h2>
  <p>We do not sell or rent your data. We share it only with service providers that help us operate — our email provider (Resend) to deliver messages, and our hosting/database provider to store enquiries securely — and where required by law.</p>
  <h2>Retention</h2>
  <p>We keep enquiry records for as long as needed to assist you and to meet legal or accounting obligations, after which they are deleted.</p>
  <h2>Your choices</h2>
  <p>You can ask us to access, correct or delete your information at any time by emailing us. To stop hearing from us, reply to any message and ask to be removed.</p>
  <h2>Contact</h2>
  <p>Guri Build Zanzibar Ltd — email <a href="mailto:hello@guriescapes.com">hello@guriescapes.com</a>.</p>
  <p class="legal-fine">This template is provided for information and should be reviewed by qualified counsel before publication.</p>
</div></section>
```

- [ ] **Step 2: Create the Terms page**

```svelte
<!-- src/routes/(public)/terms/+page.svelte -->
<svelte:head>
  <title>Terms &amp; Conditions — Guri Escapes Pongwe</title>
  <meta name="description" content="Terms governing use of the Guri Escapes Pongwe website." />
</svelte:head>
<section class="page-hero legal-hero"><div class="wrap ph-inner"><p class="crumb"><a href="/">Home</a> / Terms</p><h1>Terms &amp; Conditions</h1></div></section>
<section class="section-pad"><div class="wrap legal-body">
  <p class="lede">These terms govern your use of this website, operated by Guri Build Zanzibar Ltd. Last updated 19 July 2026.</p>
  <h2>Informational only</h2>
  <p>The content on this site — including villa descriptions, floor plans, prices, yield, occupancy and appreciation figures — is for marketing and information only and does not constitute a binding offer, financial advice, or a guarantee of return. Figures are directional and drawn from third-party market reporting. Final unit sizes and specifications may change in detailed design.</p>
  <h2>Purchases</h2>
  <p>Any purchase is governed solely by the separate written agreements you sign, which prevail over anything stated on this site.</p>
  <h2>Intellectual property</h2>
  <p>All text, imagery, renders and branding on this site are owned by or licensed to Guri Build Zanzibar Ltd and may not be reproduced without permission.</p>
  <h2>Liability</h2>
  <p>We take care to keep information accurate but do not warrant it is complete or error-free, and are not liable for decisions made in reliance on it.</p>
  <h2>Governing law</h2>
  <p>These terms are governed by the laws of Tanzania (Zanzibar). <span class="legal-fine">[Confirm jurisdiction with counsel.]</span></p>
  <h2>Contact</h2>
  <p>Guri Build Zanzibar Ltd — <a href="mailto:hello@guriescapes.com">hello@guriescapes.com</a>.</p>
</div></section>
```

- [ ] **Step 3: Add shared legal styles**

Append to `src/app.css`:

```css
.legal-hero { min-height: 34vh; }
.legal-body { max-width: 720px; }
.legal-body h2 { font-family: var(--f-display); font-weight: 400; font-size: 1.5rem; margin: 2rem 0 .6rem; color: var(--ink); }
.legal-body p { margin: 0 0 1rem; line-height: 1.7; color: var(--ink); }
.legal-body a { color: var(--wood); }
.legal-fine { font-size: .82rem; color: var(--ink-soft); }
```

- [ ] **Step 4: Verify build + routes**

Run: `npm run build`; `npm run dev`; open `/privacy` and `/terms` — both render with header/footer.

- [ ] **Step 5: Commit**

```bash
git add "src/routes/(public)/privacy" "src/routes/(public)/terms" src/app.css
git commit -m "Add Privacy Policy and Terms pages"
```

---

## Task 13: SEO — per-route metadata + JSON-LD

**Files:**
- Create: `src/lib/seo.js`
- Modify: `src/routes/(public)/+layout.svelte`
- Modify: `src/routes/(public)/+page.server.js`, `+page.svelte`
- Modify: `src/routes/(public)/[slug]/+page.server.js`, `[slug]/+page.svelte`

**Interfaces:**
- Produces: `SITE_URL`, `absUrl(path)`, `orgLd(site)`, `villaLd(villa, site)`, `faqLd(faqs)`, `breadcrumbLd(items)`.

- [ ] **Step 1: Create `seo.js`**

```js
// src/lib/seo.js
export const SITE_URL = 'https://www.guriescapes.com';
export const absUrl = (path = '/') => SITE_URL + (path.startsWith('/') ? path : `/${path}`);

export function orgLd(site = {}) {
  const c = site.contact || {};
  const sameAs = [c.instagram, c.facebook].filter(Boolean);
  return {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: 'Guri Build Zanzibar Ltd', alternateName: 'Guri Escapes', url: SITE_URL,
    logo: absUrl('/assets/img/logo-dark.png'),
    ...(c.email ? { email: c.email } : {}),
    ...(sameAs.length ? { sameAs } : {})
  };
}

export function villaLd(v = {}, site = {}) {
  return {
    '@context': 'https://schema.org', '@type': 'RealEstateListing',
    name: v.name, url: absUrl(`/${v.slug}`),
    description: `${v.name} — ${v.bedrooms}-bedroom private pool villa on a ${v.plotM2} m² walled plot, Pongwe, Zanzibar.`,
    image: v.heroImage ? [absUrl(v.heroImage)] : undefined,
    offers: v.priceFrom ? { '@type': 'Offer', price: String(v.priceFrom).replace(/[^0-9]/g, ''), priceCurrency: 'USD', availability: 'https://schema.org/InStock' } : undefined
  };
}

export function faqLd(faqs = []) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  };
}

export function breadcrumbLd(items = []) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absUrl(it.path) }))
  };
}
```

- [ ] **Step 2: Render canonical + OG in the public layout**

In `src/routes/(public)/+layout.svelte`, add to `<script>`: `import { page } from '$app/stores';` (already imported) and `import { absUrl } from '$lib/seo';`. Add a reactive `seo` with fallbacks and render a single head block:

```svelte
<script>
  // ...existing imports...
  import { absUrl, SITE_URL } from '$lib/seo';
  $: seo = $page.data?.seo ?? {};
  $: canonical = absUrl($page.url.pathname);
  $: ogTitle = seo.title || 'Guri Escapes Pongwe — Private Pool Villas in Zanzibar';
  $: ogDesc = seo.description || "Own a design-led, fully managed private pool villa on Zanzibar's calm east coast.";
  $: ogImage = absUrl(seo.image || '/assets/img/hero.jpg');
</script>

<svelte:head>
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content={seo.type || 'website'} />
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={ogDesc} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:site_name" content="Guri Escapes Pongwe" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={ogTitle} />
  <meta name="twitter:description" content={ogDesc} />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>
```

> Per-page `<title>`/`<meta name="description">` remain in each page's `svelte:head` (they don't conflict with OG tags).

- [ ] **Step 3: Return `seo` + JSON-LD from the home page**

In `src/routes/(public)/+page.server.js`, add to the returned load object: `seo: { title: 'Guri Escapes Pongwe — Private Pool Villas in Zanzibar', description: "Own a design-led, fully managed private pool villa on Zanzibar's calm east coast — from USD 90,000.", image: '/assets/img/hero.jpg', type: 'website' }`.

In `+page.svelte`, add JSON-LD in `svelte:head`:

```svelte
<script>
  // ...existing...
  import { orgLd, faqLd } from '$lib/seo';
  $: ld = [orgLd(data.site), faqLd(faqs)].filter(Boolean);
</script>
<svelte:head>
  <!-- existing title/description -->
  {@html `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
</svelte:head>
```

- [ ] **Step 4: Return `seo` + JSON-LD from the villa page**

In `src/routes/(public)/[slug]/+page.server.js`, add `seo: { title: \`${villa.name} — Guri Escapes Pongwe\`, description: \`${villa.name} — ${villa.bedrooms}-bedroom private pool villa on a ${villa.plotM2} m² walled plot, Zanzibar's east coast.\`, image: villa.heroImage, type: 'article' }` to the returned object (use the villa variable name already in that loader).

In `[slug]/+page.svelte`:

```svelte
<script>
  // ...existing...
  import { villaLd, breadcrumbLd } from '$lib/seo';
  $: ld = [villaLd(v, data.site), breadcrumbLd([{ name: 'Home', path: '/' }, { name: v.name, path: `/${v.slug}` }])];
</script>
<svelte:head>
  <!-- existing title/description -->
  {@html `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
</svelte:head>
```

- [ ] **Step 5: Verify build + view-source**

Run: `npm run build`; `npm run dev`. View-source `/`: exactly one `<link rel="canonical">`, OG tags present, one JSON-LD block containing `Organization` + `FAQPage`. View-source a villa page: canonical matches the villa URL, JSON-LD has `RealEstateListing` + `BreadcrumbList`. Paste each JSON-LD into a validator to confirm valid JSON.

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo.js "src/routes/(public)/+layout.svelte" "src/routes/(public)/+page.server.js" "src/routes/(public)/+page.svelte" "src/routes/(public)/[slug]/+page.server.js" "src/routes/(public)/[slug]/+page.svelte"
git commit -m "Add canonical, Open Graph and JSON-LD structured data"
```

---

## Task 14: Alt-text audit + image performance

**Files:**
- Modify: `src/routes/(public)/+page.svelte`, `[slug]/+page.svelte`, `src/lib/components/Gallery.svelte` (if needed)

**Interfaces:** none.

- [ ] **Step 1: Alt-text + lazy/decoding audit**

Grep every `<img` in the public routes and components:

Run: `grep -rn "<img" src/routes/\(public\) src/lib/components`

For each `<img>`:
- Ensure a meaningful `alt`, OR `alt="" aria-hidden="true"` if decorative (backgrounds: `.hero-bg`, `.invest-bg`, `.closing-bg`, `.hero-frond`, `.frond-wm`, `.dash-frond`).
- Add `loading="lazy" decoding="async"` to every image **except** the hero (`.hero-bg img` keeps eager; add `fetchpriority="high"`).
- Specifically: `.invest-bg` and `.closing-bg` imgs currently have `alt=""` and no `aria-hidden` — add `aria-hidden="true"` and `loading="lazy" decoding="async"`. Villa card images already have `alt={v.name}` — add `loading="lazy" decoding="async"`.

- [ ] **Step 2: Compression check (tooling-gated)**

Run: `ls -la static/assets/img/*.jpg` to list byte sizes. If any JPG > 400 KB and a compressor is available (`command -v cwebp || command -v convert`), produce optimized versions (target ≤ 250 KB, max-width 2000px) and replace; otherwise, print a note listing oversized files and recommended targets (do not fabricate optimization).

```bash
command -v convert && for f in static/assets/img/*.jpg; do s=$(stat -c%s "$f"); if [ "$s" -gt 409600 ]; then convert "$f" -resize '2000x2000>' -quality 82 "$f.opt" && mv "$f.opt" "$f"; fi; done || echo "No image tooling — flag oversized files for manual compression"
```

- [ ] **Step 3: Verify build + Lighthouse-ish smoke**

Run: `npm run build`. Confirm no `<img>` without `alt`/`aria-hidden` remains (re-grep). In dev, confirm below-fold images lazy-load (Network tab) and the page has no layout shift on the hero.

- [ ] **Step 4: Commit**

```bash
git add "src/routes/(public)" src/lib/components static/assets/img
git commit -m "Alt-text audit + lazy-load/decoding + image compression"
```

---

## Task 15: Full build + end-to-end smoke + branch summary

**Files:** none (verification only).

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: success, no warnings about unresolved imports.

- [ ] **Step 2: Migration unit tests**

Run: `node --test src/lib/server/migrate.test.js`
Expected: PASS.

- [ ] **Step 3: End-to-end smoke (dev)**

Run `npm run dev` and verify:
- `/` renders; Developer section present; empty CMS sections absent; "Download brochure" pre-checks the brochure option; invest section reads 2027; FAQ has the residence-permit clarification + resale entry.
- Submit an enquiry with brochure + timeframe → success; lead appears in `/admin` with help tags + timeframe; (if RESEND set + PDF uploaded) enquirer receives the attachment.
- `/villa-a` renders with JSON-LD + floor-plan slot; `/privacy` and `/terms` render.
- Footer shows TZ number + Legal links.

- [ ] **Step 4: Confirm no destructive changes**

Re-read `src/lib/server/content.js` and confirm: no `replaceOne` on `site`; villas only inserted when missing; `enquiries`/`images` never modified by the sync.

- [ ] **Step 5: Final commit / ready for review**

```bash
git add -A && git commit -m "Docs: mark plan complete" || true
git log --oneline main..HEAD
```
Expected: the full task series on `feature/conversion-trust-seo`, ready for PR.

---

## Self-review — spec coverage

- #1 brochure auto-email → Tasks 3,4,5,6 ✓
- #2 developer section → Tasks 2,9,10 ✓
- #3 renders/floor plans/progress → Tasks 9,10 (+ villa floor-plan slot noted in Task 9/10) ✓
- #4 testimonials/trust/ZIPA/RE-MAX → Tasks 9,10 ✓
- #5 stale date → Tasks 2 (CMS), 8 (hardcoded) ✓
- #6 $90k/$100k → Task 2 (defaults + migration correction) ✓
- #7 scarcity → Tasks 9,10 ✓
- #8 call booking (Calendly) → Tasks 6? no — Tasks 10,11 ✓
- #9 SEO/perf/alt → Tasks 13,14 ✓
- #10 resale FAQ → Tasks 2,3 ✓
- #11 TZ number + phone country code → Tasks 2,6,11 ✓
- #12 enquiry revamp → Task 6 ✓
- #13 US-number explanation + privacy/terms → Tasks 11,12 ✓
- Non-destructive migration (safety) → Tasks 1,3 ✓

All 13 items + the safety constraint are covered.
