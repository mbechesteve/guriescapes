<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { initReveals } from '$lib/actions/reveal';
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';

  onMount(initReveals);
  afterNavigate(async () => {
    await tick();
    setTimeout(initReveals, 30);
  });
</script>

<Header />
<slot />
<Footer />
