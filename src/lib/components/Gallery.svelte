<script>
  import { onMount } from 'svelte';

  /** @type {{src:string, alt:string, wide?:boolean}[]} */
  export let images = [];

  let isOpen = false;
  let current = 0;

  $: item = images[current] || { src: '', alt: '' };

  function open(i) {
    current = i;
    isOpen = true;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    isOpen = false;
    document.body.style.overflow = '';
  }
  function show(i) {
    current = (i + images.length) % images.length;
  }

  function onKey(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'ArrowLeft') show(current - 1);
  }

  let tx = 0,
    ty = 0;
  function touchStart(e) {
    tx = e.changedTouches[0].clientX;
    ty = e.changedTouches[0].clientY;
  }
  function touchEnd(e) {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) close();
  }

  onMount(() => {
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  });
</script>

<div class="gallery">
  {#each images as img, i}
    <a href={img.src} class:wide={img.wide} on:click|preventDefault={() => open(i)}>
      <img src={img.src} alt={img.alt} />
      <span class="zoom">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4M11 8v6M8 11h6" /></svg>
      </span>
    </a>
  {/each}
</div>

<div
  class="lb"
  class:open={isOpen}
  role="dialog"
  aria-modal="true"
  aria-label="Image viewer"
  on:touchstart={touchStart}
  on:touchend={touchEnd}
>
  <button class="lb-btn lb-close" aria-label="Close (back)" on:click={close}>
    <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
  </button>
  <button class="lb-btn lb-prev" aria-label="Previous image" on:click={() => show(current - 1)}>
    <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
  </button>
  <button class="lb-btn lb-next" aria-label="Next image" on:click={() => show(current + 1)}>
    <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
  </button>
  <div class="lb-stage" on:click|self={close}>
    <img class="lb-img" src={item.src} alt={item.alt} />
  </div>
  <div class="lb-bar">
    <span class="lb-count">{current + 1} / {images.length}</span>
    <button class="lb-back" on:click={close}>&larr; Back to gallery</button>
  </div>
</div>
