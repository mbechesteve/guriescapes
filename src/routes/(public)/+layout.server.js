import { getSiteContent } from '$lib/server/content';

export async function load() {
  const site = await getSiteContent();
  return {
    site: {
      hero: site.hero,
      metrics: site.metrics,
      contact: site.contact,
      faq: site.faq
    }
  };
}
