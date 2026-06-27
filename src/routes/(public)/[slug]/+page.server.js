import { error } from '@sveltejs/kit';
import { getVillaBySlug } from '$lib/server/content';

export async function load({ params }) {
  const villa = await getVillaBySlug(params.slug);
  if (!villa || !villa.published) throw error(404, 'Villa not found');
  return { villa };
}
