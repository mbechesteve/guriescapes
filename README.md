# Guri Escapes — Pongwe Villas website

A static, responsive marketing site for Guri Escapes Pongwe, built from the brand
guidelines and the *Pongwe Villas — Website Copy* document.

## Structure

```
index.html        Main landing page (hero → lifestyle → numbers → villas →
                  managed model → why invest → inside → features → ownership →
                  FAQ → closing CTA → enquiry → footer)
villa-a.html      Villa A detail page (gallery, spec, enquiry)
villa-b.html      Villa B detail page
assets/css/style.css   Design system + all styling
assets/js/main.js      Header, mobile menu, scroll reveals, FAQ, form handler
assets/img/            Logos, frond motif, and photography
```

It is plain HTML/CSS/JS — no build step. Open `index.html` in a browser, or host
the folder on any static host (Vercel, Netlify, S3, etc.).

## Design system (from the brand guidelines)

| Role | Name | Hex |
|------|------|-----|
| Primary / dark sections | Sage Tropical | `#41461E` |
| Accent / buttons & rules | Earthy Wood | `#BE8F5B` |
| Secondary accent | Moist Gold | `#AAAA6C` |
| Soft background | Sand Travert | `#F0E0D0` |
| Page background | Concrete Cream | `#FCF8EF` |

- **Display type:** Cormorant Garamond · **Body/UI:** Outfit (both via Google Fonts).
- **Signature element:** the woven-frond motif (`assets/img/frond.svg`) used as a
  low-opacity watermark in the hero and the numbers strip.
- Imagery and the logo were extracted from the supplied brand deck (`GURI ESCAPES.pdf`).

## ⚠️ Placeholders to confirm before go-live

The copy doc instructs: *"Replace every '___' with confirmed figures before
publishing. Pricing and ROI shown are placeholders."*

- **Prices** — currently `USD 285,000` (Villa A) / `USD 289,000` (Villa B) and
  "From USD 285,000" in the hero. Verify with sales and update in `index.html`,
  `villa-a.html`, `villa-b.html`.
- **Phone number** — `+255 ___ ___ ___` appears in the enquiry section and footer
  (and the `tel:`/`wa.me/` links). Replace with the real number.
- **WhatsApp** — `https://wa.me/255000000000` links need the real number.
- **Brochure download** — the *Download brochure* buttons currently scroll to the
  enquiry form. Point them at the real PDF when available.
- **Enquiry form** — `assets/js/main.js` (`guriSubmit`) is a front-end demo that
  shows a thank-you state. Wire it to your backend / form service (Formspree,
  HubSpot, etc.) before launch.
- **Floor plans** — referenced as "available on request"; add per-villa floor-plan
  images to each villa page when ready.
- **Real villa photography** — current images are pulled from the brand deck. Swap
  in final villa/pool renders (the brief calls for "villa + pool through the
  sliding glass, golden hour") as they become available.

The legal disclaimer in the footer is carried verbatim from the copy document.
