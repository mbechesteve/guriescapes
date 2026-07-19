# Guri Escapes — Conversion, Trust & SEO Upgrade

**Date:** 2026-07-19
**Status:** Design (awaiting review)
**Scope:** 13-item brief covering the brochure fix, trust/developer content, renders & floor
plans, third-party validation, copy corrections, urgency, call booking, SEO/performance,
resale FAQ, phone/contact compliance, and an enquiry-form revamp.

---

## 0. Guiding principles

1. **Never destroy production data.** Leads/enquiries, uploaded images, analytics and sessions
   are additive-only. The content migration must be **non-destructive** (see §1).
2. **CMS-first for anything asset- or data-dependent.** Renders, floor plans, construction
   photos, testimonials, ZIPA reference, RE/MAX report link, reservation counts, Calendly URL
   and the brochure PDF are all editable in `/admin` and every dependent section **hides itself
   when its data is empty**. No fabricated numbers, no broken image slots.
3. **Follow existing patterns.** DB-driven content seeded from `defaults.js`, admin editor at
   `/admin/content`, Mongo-stored uploads served via a hardened endpoint, best-effort Resend
   email that never blocks the response.

---

## 1. Non-destructive content migration (safety-critical)

**Problem:** `src/lib/server/content.js` currently, on a `CONTENT_VERSION` bump, runs
`replaceOne({_id:'site'}, defaults)` (full overwrite of site content) and `$set:{...villa}` over
`villa-a`/`villa-b`. Production has had admin edits, so this would flatten them.

**Change:** Replace the wipe-and-replace with a conditional, additive migration.

- Introduce a migration step (gated by `CONTENT_VERSION` 2 → 3) that, on the existing `site` doc:
  - **Adds new fields only if absent** — `developer`, `testimonials`, `trustBar`, `renders`,
    `floorPlans`, `progress`, `availability`, `brochure`, and the new `contact` sub-keys
    (`phoneTz`, `calendly`, `whatsappNote`). Implemented with `$set` on a computed patch that
    excludes any key already present in the stored doc.
  - **Applies the requested copy corrections field-by-field, only when the stored value still
    equals the known-old default** (i.e. unedited). Corrections: the stale "to 2026" metric
    caption (#5), the residence-permit FAQ answer (#6), and inserting the resale FAQ (#10). If a
    field was hand-edited, it is left untouched.
  - Adds the resale FAQ only if no FAQ entry with a matching question already exists (idempotent).
- **Villas:** stop `$set`-ing default fields over existing `villa-a`/`villa-b`. On bump, only
  `$set` genuinely-missing new fields (e.g. a per-villa `floorPlan` slot if added); never
  overwrite name/price/gallery/spec/images. New default villas that don't exist are still
  inserted via `$setOnInsert` (unchanged for fresh DBs).
- Fresh-DB behaviour is unchanged: a brand-new database still seeds full defaults.
- The migration records `version: 3` in `meta` so it runs exactly once.

**Acceptance:** On a DB with prior admin edits, after deploy: edited fields are preserved, new
fields appear with default values, the three copy fixes apply only to still-default fields, and
`enquiries`/`images` are untouched. Verified by seeding a doc with edits + old defaults, running
the migration, and asserting the diff.

---

## 2. Content model additions

All optional; all hidden when empty. Seeded in `src/lib/content/defaults.js`, sanitized in
`src/routes/admin/content/+page.server.js`, surfaced via `getSiteContent()`.

```
site.developer   = { eyebrow, heading, body: [para, ...], since, image }
site.testimonials= [ { quote, name, role } ]
site.trustBar    = { zipa, remaxReportUrl, note, press: [ { label, url } ] }
site.renders     = [ { src, alt, caption } ]      // architectural renders
site.floorPlans  = [ { src, alt, caption } ]      // on-page floor plans
site.progress    = [ { src, alt, caption, date } ]// construction photos
site.availability= { reserved, total, note }      // scarcity; shows only if total set
site.brochure    = { fileUrl, name, uploadedAt }  // the PDF
site.contact.phoneTz     = "+255 799 109621"       // call-only TZ number
site.contact.calendly    = ""                       // booking URL
site.contact.whatsappNote= "International line"      // explains the +1 WhatsApp number
```

Admin editor (`/admin/content`) gains sections/repeaters for developer, testimonials, trust bar,
renders, floor plans, progress, availability, the new contact fields, and the brochure uploader.
Each repeater mirrors the existing FAQ/metrics add-remove pattern.

---

## 3. Brochure auto-email pipeline (#1 — fix first)

**PDF storage & upload**
- New `documents` Mongo collection: `{ data: Buffer, contentType:'application/pdf', name, size, createdAt }`.
- New `POST /api/upload/doc` (admin-only): accepts a PDF, verifies magic bytes (`%PDF-`),
  10 MB cap, stores in `documents`, returns `{ url: '/api/doc/<id>', name }`.
- New `GET /api/doc/[id]`: serves `application/pdf` with `X-Content-Type-Options: nosniff`,
  `Content-Disposition: attachment; filename="..."`, long cache. Mirrors the hardened
  `/api/img/[id]` handler.
- `/admin/content` "Brochure (PDF)" uploader saves `{fileUrl,name,uploadedAt}` into `site.brochure`.

**Buttons → intent**
- The two "Download brochure" CTAs (hero + closing) keep `href="#enquire"` and, on click, set a
  shared store `brochureIntent=true` (`$lib/stores/enquiry.js`) so the enquiry form pre-selects
  "Send me the brochure and price list". Graceful without JS (still scrolls to the form).

**Email on submit**
- `sendEmail()` gains `attachments` support (`Resend attachments: [{ filename, content(base64) }]`).
- New template `brochureEmail(lead, site)` — friendly cover note + brand shell.
- In `POST /api/enquire`, after the lead is saved and the team notified (all best-effort,
  never blocking the response):
  - Determine `wantsBrochure` = `help` includes "Send me the brochure and price list" **or**
    `source === 'brochure'`.
  - If `wantsBrochure` and `site.brochure.fileUrl` exists → email the enquirer with the PDF
    attached (fetch bytes straight from the `documents` collection, not over HTTP).
  - If `wantsBrochure` but no PDF uploaded yet → send a "we'll email it to you shortly" note.
  - Requires a valid enquirer email (already validated).

**Acceptance:** With a PDF uploaded and RESEND configured, submitting the form with the brochure
option selected delivers an email with the PDF attached; the response is not blocked if email
fails. Without a PDF, a placeholder note is sent. Team notification still fires.

---

## 4. Enquiry form revamp + phone country code (#12, #11)

`EnquiryForm.svelte` replaces the single `interest` select with:

- **"How can we help?"** — multi-select checkboxes (name `help`), options exactly:
  Send me the brochure and price list · Show me the projected rental returns · Explain the
  payment plan · Explain foreign ownership and legal structure · Help me compare Villa A and
  Villa B · I'm interested in purchasing both villas · Arrange a call or site visit.
  Pre-checks "Send me the brochure and price list" when `brochureIntent` is set. On villa pages,
  pre-checks "Help me compare Villa A and Villa B".
- **"When are you considering purchasing?"** — single `<select>` (name `timeframe`):
  Immediately · Within 1–3 months · Within 3–6 months · Within 6–12 months · Just researching.
- **Phone** → country-code `<select>` (name `dialCode`, curated list: Tanzania +255 default,
  Kenya +254, then common: UK, US, UAE, ZA, DE, IT, etc.) + numeric input (name `phoneNumber`).
  Combined client-side into `phone` = `"<dial> <number>"`.
- First/last/email unchanged and required; message optional.

**API (`/api/enquire`)** accepts and stores `help` (array, capped/sanitized → also a joined
string for display), `timeframe`, and the combined `phone`. Back-compat: still accepts a plain
`interest` if sent. The doc gains `help: []`, `timeframe: ''`.

**Admin** (`/admin/+page.svelte` + its `+page.server.js` serializer): the lead drawer shows
`help` (as tags) and `timeframe`; the table's "Interest" column shows the first help item or a
summary. The notification email (`newEnquiryEmail`) lists How-we-can-help and Timeframe rows.

---

## 5. Contact, compliance & call booking (#8, #11, #13)

- **TZ call-only number** (`contact.phoneTz`) rendered in the enquiry contact line and the footer,
  labelled "Call only", `tel:` link. Hidden when empty.
- **WhatsApp explanation** — small caption using `contact.whatsappNote` next to the WhatsApp link
  ("International line — WhatsApp only"), so the +1 number reads intentionally.
- **Calendly** — a "Book a call" button near the enquiry form and in the footer, linking to
  `contact.calendly` in a new tab (`rel="noopener"`). Hidden when empty. (Button/link, not an
  embedded widget — lighter, no CLS.)
- **Privacy Policy** (`(public)/privacy`) and **Terms** (`(public)/terms`) — static routes with
  drafted content for a marketing site that collects enquiry data on behalf of Guri Build
  Zanzibar Ltd (what's collected, why, retention, contact, no-sale-of-data, cookies/analytics
  note; Terms: informational-only, no binding offer, IP, governing law placeholder). Linked from
  a new footer "Legal" group. Content is reviewable/editable text, clearly marked as a template
  the client should have counsel confirm.

---

## 6. New / updated home sections

Order on the home page (insertions between existing sections):

1. **About the developer** (#2) — after the "Managed model" section. Seeded copy:
   > Guri Build Zanzibar is the development company behind Guri Escapes Pongwe… (full provided
   > text). "Building on the project-delivery experience of Guri Build Kenya…" … "Our first
   > two-bedroom villas in Pongwe are now available from USD 90,000." Includes "2 years operating"
   > and an optional image slot.
2. **Renders** gallery (#3) — architectural exterior / pool-terrace renders (`site.renders`),
   reusing `Gallery.svelte`. Hidden when empty.
3. **Floor plans** on-page (#3) — `site.floorPlans` shown as images with captions (not gated
   behind the brochure). Hidden when empty. Villa detail pages also surface a floor-plan slot.
4. **Construction progress** (#3) — `site.progress` dated photo strip. Hidden when empty.
5. **Trust bar + testimonials** (#4) — a compact bar (ZIPA registration reference, RE/MAX report
   link, press items) plus a testimonials block. Each half hides independently when empty.
6. **Scarcity** (#7) — on the villas section, an "X of Y villas reserved" indicator rendered only
   when `availability.total` is set. Never fabricated.

All new sections are responsive, match the existing type/spacing system, use the `reveal`
animation action, and carry proper `alt` text.

---

## 7. Copy corrections (#5, #6, #10)

- **#5 stale date:** metric caption "Projected land growth to **2026**\*" → reframed to
  **2027** (and the hardcoded invest-stat "Projected land appreciation to 2026" + FAQ "toward
  1 million arrivals by 2026" reframed to remove the passed/looming-2026 framing). Applied via
  the conditional migration for the CMS-stored strings; the hardcoded `+page.svelte` invest-stat
  is edited directly.
- **#6 $90k vs $100k:** rewrite the ownership FAQ answer to clarify that a single villa at
  USD 90,000 is a leasehold purchase, while the **investment residence permit** requires a total
  qualifying investment of **USD 100,000+**, typically met by purchasing both villas or an
  upgraded/furnished package. Removes the apparent contradiction.
- **#10 resale/exit:** new FAQ entry — "Can I resell or exit later?" → uses the provided line:
  we can help owners sell or offload to our ready pool of buyers; plus a note on the managed
  resale process and liquidity.

---

## 8. SEO & performance (#9, #13)

- **Per-route SEO object.** Each public route's `load` returns
  `seo: { title, description, canonicalPath, image, type }`. The public `+layout.svelte` renders
  canonical + Open Graph + Twitter tags **once** from it (avoids duplicate-tag issues from
  multiple `svelte:head`). Canonical base `https://www.guriescapes.com` (configurable via an env
  fallback).
- **JSON-LD structured data:**
  - `Organization` (Guri Build Zanzibar Ltd — name, url, logo, sameAs socials) site-wide.
  - `RealEstateListing` (or `Product`+`Offer`) per villa (name, price USD, description, images).
  - `FAQPage` from the FAQ list on the home page.
  - `BreadcrumbList` on villa detail pages.
- **Alt-text audit:** every `<img>` gets a meaningful `alt`, or `alt="" aria-hidden` if purely
  decorative (hero frond, background layers). New CMS images carry editable `alt`.
- **Performance:** `loading="lazy"` + `decoding="async"` on below-the-fold images (hero stays
  eager/`fetchpriority`); intrinsic `width`/`height` where feasible to cut CLS; audit hero and
  lifestyle image byte sizes and compress if tooling (sharp/imagemagick) is available in the
  environment — otherwise flag the specific files and recommended target sizes.
- **OG image:** default to the hero image; villa pages use their hero image.

---

## 9. Files touched (summary)

- `src/lib/content/defaults.js` — new default fields + corrected copy + `CONTENT_VERSION` logic
  input.
- `src/lib/server/content.js` — **rewrite the sync to non-destructive conditional migration**;
  bump version to 3.
- `src/lib/server/email.js` — `attachments` support + `brochureEmail` + extra rows in
  `newEnquiryEmail`.
- `src/lib/server/db.js` — `documents()` collection helper.
- `src/routes/api/enquire/+server.js` — store `help`/`timeframe`; brochure email logic.
- `src/routes/api/upload/doc/+server.js` (new), `src/routes/api/doc/[id]/+server.js` (new).
- `src/lib/components/EnquiryForm.svelte` — revamped fields + phone country code + brochure intent.
- `src/lib/stores/enquiry.js` (new) — `brochureIntent`.
- `src/routes/(public)/+page.svelte` — new sections, scarcity, copy fixes, SEO/JSON-LD, alt/lazy.
- `src/routes/(public)/[slug]/+page.svelte` — floor-plan slot, SEO/JSON-LD, alt/lazy.
- `src/routes/(public)/+layout.svelte` + `+layout.server.js` — SEO rendering + `seo` passthrough.
- `src/routes/(public)/+page.server.js`, `[slug]/+page.server.js` — return `seo`.
- `src/routes/(public)/privacy/+page.svelte`, `terms/+page.svelte` (new).
- `src/routes/admin/content/+page.svelte` + `+page.server.js` — new editor sections + sanitizers +
  brochure uploader.
- `src/routes/admin/+page.svelte` + `+page.server.js` — show `help`/`timeframe` on leads.
- `src/lib/components/Footer.svelte` — Legal links, TZ number, Calendly, WhatsApp note.
- `src/app.html` — base OG/meta defaults if needed.

---

## 10. Testing / verification

- **Migration:** unit-style check — seed a `site` doc containing (a) an edited hero, (b) an
  edited contact field, (c) the *old* stale metric caption, (d) no new fields; run the migration;
  assert edited fields preserved, new fields added, stale caption corrected, villas untouched,
  `enquiries` collection untouched. Run against a local Mongo, not production.
- **Brochure flow:** upload a sample PDF in admin, submit the form with the brochure option, and
  confirm (via Resend logs / MAIL_TO) an email with the attachment; confirm the lead saved with
  `help`/`timeframe`.
- **Empty-state:** with all new CMS fields empty, confirm every new section is absent from the
  rendered page and there are no broken image slots.
- **SEO:** view-source each route for one canonical tag, OG tags, and valid JSON-LD (validate
  shape); run an alt-text scan asserting no non-decorative `<img>` lacks `alt`.
- **Build:** `npm run build` passes; manual smoke of home, a villa page, privacy, terms, admin.

---

## 11. Out of scope / dependencies on the client

- Actual brochure **PDF** (upload via admin).
- Renders, floor plans, construction photos (upload via admin).
- **Resend API key + verified sending domain** created under the guribuild account (env var).
- Calendly URL, real reservation counts, testimonials, ZIPA registration reference, RE/MAX
  report link — entered via admin.
- Legal review of the Privacy/Terms template text by the client's counsel.
