import { error } from '@sveltejs/kit';
import { getVillaBySlug } from '$lib/server/content';

export async function load({ params }) {
  const villa = await getVillaBySlug(params.slug);
  if (!villa || !villa.published) throw error(404, 'Villa not found');
  return {
    villa,
    seo: {
      title: `${villa.name} — Guri Escapes Pongwe`,
      description: `${villa.name} — ${villa.bedrooms}-bedroom private pool villa on a ${villa.plotM2} m² walled plot, Zanzibar's east coast.`,
      image: villa.heroImage,
      type: 'article'
    }
  };
}
