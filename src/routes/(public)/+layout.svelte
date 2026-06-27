<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { initReveals } from '$lib/actions/reveal';
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';

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

<Header />
<slot />
<Footer />
