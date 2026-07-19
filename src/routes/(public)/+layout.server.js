import { getSiteContent } from '$lib/server/content';

export async function load() {
  const site = await getSiteContent();
  return {
    site: {
      hero: site.hero,
      metrics: site.metrics,
      contact: site.contact,
      faq: site.faq,
      developer: site.developer || null,
      renders: site.renders || [],
      floorPlans: site.floorPlans || [],
      progress: site.progress || [],
      trustBar: site.trustBar || null,
      testimonials: site.testimonials || [],
      availability: site.availability || null
    }
  };
}
