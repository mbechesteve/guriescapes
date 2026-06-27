// Default site content + villas. Used to seed MongoDB on first run and as a
// fallback if the DB is unavailable. Editable afterwards from /admin.

export const defaultSiteContent = {
  _id: 'site',
  hero: {
    eyebrow: "Pongwe · Zanzibar's East Coast",
    headline: "Own a private pool villa on Zanzibar's calm east coast.",
    sub: 'Two design-led, fully managed villas in Pongwe — built for hands-off income, owned for a lifetime of slow island mornings.',
    priceFrom: '90,000'
  },
  metrics: [
    { num: 'USD 90k', label: 'Starting price', cap: 'Per villa, leasehold' },
    { num: '18–22%', label: 'Target gross yield', cap: 'Short-stay, depending on unit & season' },
    { num: '20%', label: 'Down payment', cap: 'Tailored milestone payment plans' },
    { num: '30–40%', label: 'Capital appreciation', cap: 'Projected land growth to 2026*' }
  ],
  contact: {
    email: 'hello@guriescapes.com',
    phone: '+255 ___ ___ ___',
    whatsapp: '255000000000',
    instagram: 'https://instagram.com/guriescapes',
    facebook: 'https://facebook.com/guriescapes'
  },
  faq: [
    {
      q: 'Can international buyers own property in Zanzibar?',
      a: 'Yes. Foreign buyers hold a long leasehold — up to 99 years, renewable — most straightforwardly inside government-approved (ZIPA) developments. A qualifying purchase (from USD 100,000) can also support an investment residence permit. We provide full legal and visa guidance for a smooth, compliant process.'
    },
    {
      q: 'Is the villa managed for me?',
      a: 'Yes. Each villa is run under a full-service hospitality model — guests, bookings, housekeeping, maintenance and revenue management are all handled for you, with regular owner reporting and distributions.'
    },
    {
      q: 'How does tourism support returns in Pongwe?',
      a: "Zanzibar's visitor numbers are climbing toward 2 million arrivals by 2026. Pongwe's calm, design-led east coast is exactly what today's premium traveller seeks, driving strong, year-round short-stay demand for private pool villas."
    },
    {
      q: 'Does Pongwe offer long-term growth?',
      a: 'Land values are projected to appreciate 30–40% as new air routes and power infrastructure complete. Owners earn income now and layer capital upside on top — income today, appreciation tomorrow.'
    },
    {
      q: 'How are my payments protected?',
      a: 'We structure purchases with the safeguards serious investors expect: independent legal and quantity-surveyor representation, segregated escrow, milestone-based payments and a foundations-first rule. Your advisors stay independent of the seller.'
    }
  ]
};

export const defaultVillas = [
  {
    slug: 'villa-a',
    name: 'Villa A — Pongwe',
    order: 1,
    published: true,
    plotM2: '1,107',
    builtUpM2: '146',
    bedrooms: '2',
    priceFrom: '90,000',
    tagline: 'A private escape on its own walled plot.',
    heroImage: '/assets/img/interior-lamp.jpg',
    cardImage: '/assets/img/interior-lamp.jpg',
    intro: [
      'Villa A is single-storey and open-plan — the lounge and island kitchen run the full width of the home, then open onto a private pool terrace through full-height sliding glass. Two quiet, garden-facing bedrooms sit to one side.',
      "High ceilings, shaded verandas and natural cross-ventilation keep it cool without working the air-conditioning — lower running costs for you, a better stay for guests. Taken alone it's a serene bolt-hole; paired with Villa B, a turnkey managed investment."
    ],
    spec: [
      { k: 'Bedrooms', v: '2, garden-facing' },
      { k: 'Living', v: '42 m² open-plan' },
      { k: 'Kitchen / dining', v: '31 m², island' },
      { k: 'Pool', v: 'Private, sun deck' },
      { k: 'Roof', v: 'Makuti-style thatch' },
      { k: 'Plot', v: '1,107 m², walled' }
    ],
    gallery: [
      { src: '/assets/img/interior-lamp.jpg', alt: 'Open-plan living and dining' },
      { src: '/assets/img/hero.jpg', alt: 'Daybed terrace bathed in golden light' },
      { src: '/assets/img/lifestyle-hammock.jpg', alt: 'Hammock in the garden' },
      { src: '/assets/img/interior-application.jpg', alt: 'Terrace framed by planting' },
      { src: '/assets/img/pool.jpg', alt: 'The private pool' },
      { src: '/assets/img/lounge.jpg', alt: 'Lounge corner' }
    ]
  },
  {
    slug: 'villa-b',
    name: 'Villa B — Pongwe',
    order: 2,
    published: true,
    plotM2: '1,101',
    builtUpM2: '146',
    bedrooms: '2',
    priceFrom: '94,000',
    tagline: 'The quieter twin, on its own grounds.',
    heroImage: '/assets/img/interior-application.jpg',
    cardImage: '/assets/img/interior-application.jpg',
    intro: [
      'Villa B mirrors Villa A — single-storey, open-plan living running the full width of the home, then dissolving into a private pool terrace through full-height sliding glass. Two garden-facing bedrooms keep the sleeping quiet and cool.',
      'Set on its own walled 1,101 m² plot, it lives beautifully as a standalone retreat and performs as a managed short-stay rental. Pair it with Villa A for a turnkey two-villa investment on one calm stretch of coast.'
    ],
    spec: [
      { k: 'Bedrooms', v: '2, garden-facing' },
      { k: 'Living', v: '42 m² open-plan' },
      { k: 'Kitchen / dining', v: '31 m², island' },
      { k: 'Pool', v: 'Private, sun deck' },
      { k: 'Roof', v: 'Makuti-style thatch' },
      { k: 'Plot', v: '1,101 m², walled' }
    ],
    gallery: [
      { src: '/assets/img/interior-application.jpg', alt: 'Terrace framed by lush planting' },
      { src: '/assets/img/pool.jpg', alt: 'The private pool' },
      { src: '/assets/img/lounge.jpg', alt: 'Lounge corner' },
      { src: '/assets/img/hero.jpg', alt: 'Daybed terrace in golden light' },
      { src: '/assets/img/lifestyle-hammock.jpg', alt: 'Hammock in the garden' },
      { src: '/assets/img/beach-palm.jpg', alt: 'Palm against the east-coast sky' }
    ]
  }
];
