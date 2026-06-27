import { getPublishedVillas } from '$lib/server/content';

export async function load() {
  return { villas: await getPublishedVillas() };
}
