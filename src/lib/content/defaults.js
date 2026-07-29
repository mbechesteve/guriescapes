// Default site content + villas. Used to seed MongoDB on first run and as a
// fallback if the DB is unavailable. Editable afterwards from /admin.

export const defaultSiteContent = {
  _id: 'site',
  hero: {
    eyebrow: "Pongwe · Zanzibar's East Coast",
    headline: "Own a private pool villa on Zanzibar's calm east coast.",
    sub: "Income while you're away. Paradise when you're here. Two design-led, fully managed villas in Pongwe, hands-off returns and a lifetime of slow island mornings.",
    priceFrom: '90,000'
  },
  metrics: [
    { num: 'USD 90k', label: 'Starting price', cap: 'Per villa, leasehold' },
    { num: '18–22%', label: 'Target gross yield', cap: 'Short-stay, depending on unit & season' },
    { num: '10%', label: 'Down payment', cap: 'Tailored milestone payment plans' },
    { num: '30–40%', label: 'Capital appreciation', cap: 'Projected land growth to 2027*' }
  ],
  developer: {
    eyebrow: 'About the developer',
    heading: 'Built by Guri Build Zanzibar.',
    since: '4 years',
    body: [
      'Guri Build Zanzibar is the development company behind Guri Escapes Pongwe, a collection of private pool villas designed for island living and managed rental income.',
      'Building on the project-delivery experience of Guri Build Kenya, we manage the full development journey: land, design, approvals, construction, buyer reporting and handover. After completion, Guri Escapes manages reservations, guests, maintenance and owner returns.',
      'Our first two-bedroom villas in Pongwe are now available from USD 90,000.'
    ],
    image: ''
  },
  testimonials: [],
  trustBar: { zipa: '', remaxReportUrl: '', note: '', press: [] },
  renders: [
    { src: '/assets/img/render-aerial.jpg', alt: 'Aerial view of the villa, pool terrace and walled gardens', wide: true },
    { src: '/assets/img/render-pool.jpg', alt: 'Private pool and sun-deck terrace framed by the villa' },
    { src: '/assets/img/render-firepit.jpg', alt: 'Sunken garden fire pit with the villa and pool beyond' },
    { src: '/assets/img/render-parking.jpg', alt: 'Landscaped garden approach from the parking court' },
    { src: '/assets/img/render-living.jpg', alt: 'Open-plan living room with woven textures and island craft' },
    { src: '/assets/img/render-living-seat.jpg', alt: 'Living room framed by sheer curtains, opening to the pool' },
    { src: '/assets/img/render-bathroom-shower.jpg', alt: 'En-suite bathroom leading to a private outdoor shower garden' },
    { src: '/assets/img/render-vessel-sink.jpg', alt: 'Vessel sink and warm timber vanity in the second bathroom' },
    { src: '/assets/img/render-roof-palm.jpg', alt: 'Makuti-thatched roof against the palms and island sky' },
    { src: '/assets/img/render-hammock.jpg', alt: 'A hammock strung in the villa gardens beneath the palms' }
  ],
  floorPlans: [
    { src: '/assets/img/site-plan.jpg', alt: 'Site plan of Villa A and Villa B', caption: 'Site plan — the two villas, each on its own walled plot' },
    { src: '/assets/img/villa-a-overview.jpg', alt: 'Villa A layout overview', caption: 'Villa A — layout: living, kitchen, pool, two bedrooms and gardens' },
    { src: '/assets/img/villa-a-floorplan.jpg', alt: 'Villa A floor plan', caption: 'Villa A floor plan (Villa B is mirrored)', wide: true }
  ],
  progress: [],
  availability: { reserved: '', total: '', note: '' },
  brochure: { fileUrl: '', name: '', uploadedAt: null },
  contact: {
    email: 'hello@guriescapes.com',
    phone: '+1 641 955 3743',
    phoneTz: '+255 799 109621',
    whatsapp: '16419553743',
    whatsappNote: 'International line — WhatsApp only',
    calendly: 'https://calendly.com/guriescapes-sales/discovery-call',
    instagram: 'https://instagram.com/guriescapes',
    facebook: 'https://facebook.com/guriescapes'
  },
  faq: [
    {
      q: 'Can international buyers own property in Zanzibar?',
      a: 'Yes. Foreign buyers hold a long leasehold — up to 99 years (33-year renewable terms) — most straightforwardly inside government-approved (ZIPA) developments. A single villa at USD 90,000 is a leasehold purchase; the investment residence permit is a separate, optional route that requires a total qualifying investment from USD 100,000, which buyers typically reach by taking both villas or an upgraded, furnished package. We provide full legal and visa guidance for a smooth, compliant process.'
    },
    {
      q: 'Is the villa managed for me?',
      a: 'Yes. Each villa is run under a full-service hospitality model — guests, bookings, housekeeping, maintenance and revenue management are all handled for you, with regular owner reporting and distributions.'
    },
    {
      q: 'How does tourism support returns in Pongwe?',
      a: "Zanzibar's visitor numbers are climbing past 1 million arrivals, with growth projected through 2027. Pongwe's calm, design-led east coast is exactly what today's premium traveller seeks, driving strong, year-round short-stay demand for private pool villas."
    },
    {
      q: 'Does Pongwe offer long-term growth?',
      a: 'Land values are projected to appreciate 30–40% as new air routes and power infrastructure complete. Owners earn income now and layer capital upside on top — income today, appreciation tomorrow.'
    },
    {
      q: 'How are my payments protected?',
      a: 'We structure purchases with the safeguards serious investors expect: independent legal and quantity-surveyor representation, segregated escrow, milestone-based payments and a foundations-first rule. Your advisors stay independent of the seller.'
    },
    {
      q: 'Can I resell or exit my investment later?',
      a: 'Yes. Villas are transferable, and when you decide to exit we can help you sell or offload your investment to our ready pool of buyers — the same audience already drawn to Pongwe. As the managing operator we can market your villa with a proven income record, which supports resale value and liquidity.'
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
      'Villa A is single-storey and open-plan — the lounge and island kitchen run the full width of the home, then open onto a private pool terrace through full-height sliding glass. Two quiet, pool and garden-facing bedrooms sit to one side.',
      "High ceilings, shaded verandas and natural cross-ventilation keep it cool without working the air-conditioning — lower running costs for you, a better stay for guests. Taken alone it's a serene bolt-hole; paired with Villa B, a turnkey managed investment."
    ],
    spec: [
      { k: 'Bedrooms', v: '2, pool and garden-facing' },
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
    priceFrom: '90,000',
    tagline: 'The quieter twin, on its own grounds.',
    heroImage: '/assets/img/interior-application.jpg',
    cardImage: '/assets/img/interior-application.jpg',
    intro: [
      'Villa B mirrors Villa A — single-storey, open-plan living running the full width of the home, then dissolving into a private pool terrace through full-height sliding glass. Two pool and garden-facing bedrooms keep the sleeping quiet and cool.',
      'Set on its own walled 1,101 m² plot, it lives beautifully as a standalone retreat and performs as a managed short-stay rental. Pair it with Villa A for a turnkey two-villa investment on one calm stretch of coast.'
    ],
    spec: [
      { k: 'Bedrooms', v: '2, pool and garden-facing' },
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
    'contact.calendly': 'https://calendly.com/guriescapes-sales/discovery-call'
  },
  corrections: [
    {
      path: 'metrics.1.num',
      oldValue: '15–18%',
      newValue: '18–22%'
    },
    {
      path: 'metrics.2.num',
      oldValue: '20%',
      newValue: '10%'
    },
    {
      path: 'developer.since',
      oldValue: '2 years',
      newValue: '4 years'
    },
    {
      path: 'floorPlans',
      oldValue: [
        { src: '/assets/img/site-plan.jpg', alt: 'Site plan of Villa A and Villa B', caption: 'Site plan — the two villas, each on its own walled plot' },
        { src: '/assets/img/villa-a-overview.jpg', alt: 'Villa A layout overview', caption: 'Villa A — layout: living, kitchen, pool, two bedrooms and gardens' },
        { src: '/assets/img/villa-a-floorplan.jpg', alt: 'Villa A floor plan', caption: 'Villa A floor plan (Villa B is mirrored)' }
      ],
      newValue: defaultSiteContent.floorPlans
    },
    {
      path: 'contact.calendly',
      oldValue: '',
      newValue: 'https://calendly.com/guriescapes-sales/discovery-call'
    },
    {
      path: 'renders',
      oldValue: [],
      newValue: defaultSiteContent.renders
    },
    {
      path: 'floorPlans',
      oldValue: [],
      newValue: defaultSiteContent.floorPlans
    },
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
