import { getPublishedVillas } from '$lib/server/content';

export async function load() {
  return {
    villas: await getPublishedVillas(),
    seo: {
      title: 'Guri Escapes Pongwe — Private Pool Villas in Zanzibar',
      description: "Own a design-led, fully managed private pool villa on Zanzibar's calm east coast — from USD 90,000.",
      image: '/assets/img/hero.jpg',
      type: 'website'
    }
  };
}
