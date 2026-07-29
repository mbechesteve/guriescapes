<script>
  import Lightbox from '$lib/components/Lightbox.svelte';

  /** @type {{src:string, alt:string, wide?:boolean}[]} */
  export let images = [];

  let lightbox;
</script>

<div class="gallery">
  {#each images as img, i}
    <a href={img.src} class:wide={img.wide} on:click|preventDefault={() => lightbox.open(i)}>
      <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
      <span class="zoom">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4M11 8v6M8 11h6" /></svg>
      </span>
    </a>
  {/each}
</div>

<Lightbox bind:this={lightbox} {images} />
