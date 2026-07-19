<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { initReveals } from '$lib/actions/reveal';
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { absUrl, SITE_URL } from '$lib/seo';

  $: seo = $page.data?.seo ?? {};
  $: canonical = absUrl($page.url.pathname);
  $: ogTitle = seo.title || 'Guri Escapes Pongwe — Private Pool Villas in Zanzibar';
  $: ogDesc = seo.description || "Own a design-led, fully managed private pool villa on Zanzibar's calm east coast.";
  $: ogImage = absUrl(seo.image || '/assets/img/hero.jpg');

  function track(path) {
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path }),
        keepalive: true
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }

  onMount(() => {
    initReveals();
    track($page.url.pathname);
  });
  afterNavigate(async (nav) => {
    await tick();
    setTimeout(initReveals, 30);
    // Only count real page navigations (not initial mount, which onMount handled).
    if (nav.from && nav.to && nav.from.url.pathname !== nav.to.url.pathname) {
      track(nav.to.url.pathname);
    }
  });
</script>

<svelte:head>
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content={seo.type || 'website'} />
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={ogDesc} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:site_name" content="Guri Escapes Pongwe" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={ogTitle} />
  <meta name="twitter:description" content={ogDesc} />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>

<Header />
<slot />
<Footer />
