// src/lib/seo.js
export const SITE_URL = 'https://www.guriescapes.com';
export const absUrl = (path = '/') => {
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL + (path.startsWith('/') ? path : `/${path}`);
};

export function ldScript(ld) {
  return `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}<\/script>`;
}

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
  const price = v.priceFrom ? String(v.priceFrom).replace(/[^0-9]/g, '') : '';
  return {
    '@context': 'https://schema.org', '@type': 'RealEstateListing',
    name: v.name, url: absUrl(`/${v.slug}`),
    description: `${v.name} — ${v.bedrooms}-bedroom private pool villa on a ${v.plotM2} m² walled plot, Pongwe, Zanzibar.`,
    image: v.heroImage ? [absUrl(v.heroImage)] : undefined,
    offers: price ? { '@type': 'Offer', price, priceCurrency: 'USD', availability: 'https://schema.org/InStock' } : undefined
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
