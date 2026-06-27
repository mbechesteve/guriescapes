# Guri Escapes — Pongwe Villas

A **SvelteKit** site for Guri Escapes Pongwe: the public marketing site plus a
password-protected **admin backend** for viewing enquiries, backed by **MongoDB**.

## Stack

- **SvelteKit 2** (Svelte 4) with `@sveltejs/adapter-node` (runs as a Node server)
- **MongoDB** (official `mongodb` driver) for storing enquiries
- Vanilla CSS design system in `src/app.css` (unchanged brand: Sage / Wood / Gold / Sand / Cream; Cormorant Garamond + Outfit)

## Project layout

```
src/
  app.html                      HTML shell (fonts, favicon)
  app.css                       Global design system
  hooks.server.js               Guards /admin (redirects to login)
  lib/
    server/db.js                MongoDB connection + enquiries collection
    server/auth.js              Password check + signed session cookie
    actions/reveal.js           Scroll-reveal initialiser
    components/                  Header, Footer, EnquiryForm, Gallery (lightbox)
  routes/
    (public)/                   Public site (shares Header + Footer)
      +page.svelte              Home (all landing sections)
      villa-a/+page.svelte      Villa A
      villa-b/+page.svelte      Villa B
    api/enquire/+server.js      POST: validate + save an enquiry
    admin/+page.svelte          Enquiries dashboard (search + filter)
    admin/+page.server.js       Loads enquiries from MongoDB
    admin/login/                Password login (form action)
    admin/logout/+server.js     Clears the session cookie
static/assets/img/              Logos, frond, photography
```

## Setup

1. Copy env and fill it in:
   ```bash
   cp .env.example .env
   ```
   - `MONGODB_URI` — local `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI
   - `MONGODB_DB` — database name (default `guriescapes`)
   - `ADMIN_USERNAME` — the admin login username
   - `ADMIN_PASSWORD` — the admin login password
   - `SESSION_SECRET` — HMAC key that signs the session cookie. Generate one with:
     `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

   `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `SESSION_SECRET` are **required in
   production** — the app refuses to start without them (dev falls back to safe
   defaults).

2. Install and run in development:
   ```bash
   npm install
   npm run dev
   ```
   Public site: http://localhost:5173 · Admin: http://localhost:5173/admin

## Production

```bash
npm run build
ORIGIN="https://your-domain.com" node build      # plus the env vars above
```

`ORIGIN` must be set in production so SvelteKit accepts the login form POST
(CSRF origin check). In `npm run dev` this is automatic.

## Admin

- Visit `/admin` → redirected to `/admin/login` if not signed in.
- Enter `ADMIN_USERNAME` + `ADMIN_PASSWORD`. On success a **random 256-bit
  session token** is stored in a `sessions` collection (with a 7-day TTL index)
  and set as an httpOnly, sameSite=lax, `secure`-in-production cookie. Every
  request validates the cookie by DB lookup; logout deletes the session row.
- The dashboard lists every enquiry (newest first) with search and a source
  filter, each card showing name, email, phone, interest, source and message.

## Enquiries

The site forms (home + each villa) POST JSON to `/api/enquire`, which validates
and stores: `firstname, lastname, email, phone, interest, message, source,
createdAt, read`. On success the form shows a thank-you and resets.

## Placeholders to confirm before go-live

- **Prices** — `USD 90,000` (Villa A) / `USD 94,000` (Villa B), and "From USD
  90,000" in the hero/metric strip.
- **Phone / WhatsApp** — `+255 ___ ___ ___` and `wa.me/255000000000`.
- **Brochure** — the "Download brochure" buttons currently scroll to the enquiry
  form; point them at the real PDF when ready.
- **Email notifications** — enquiries are stored in MongoDB and shown in /admin;
  wire up an email/Slack notification on new submissions if desired.
- **Real villa photography** — current images are from the brand deck; swap in
  final renders when available.

Legal disclaimer in the footer is carried verbatim from the brand copy.
