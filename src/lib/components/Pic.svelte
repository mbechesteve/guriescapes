<script>
  /**
   * Renders a vite-imagetools `as=picture` import as <picture> with AVIF/WebP
   * sources and a JPEG fallback. Pair with `picture{display:contents}` in
   * app.css so existing `... img` rules keep working.
   */
  export let picture;
  export let alt;
  export let sizes = undefined;
  export let loading = 'lazy';
  export let decoding = 'async';
  export let fetchpriority = undefined;

  const srcset = (v) => (Array.isArray(v) ? v.map((s) => `${s.src} ${s.w}w`).join(', ') : v);
</script>

<picture>
  {#each Object.entries(picture.sources) as [format, set]}
    <source type={'image/' + format} srcset={srcset(set)} {sizes} />
  {/each}
  <img
    src={picture.img.src}
    width={picture.img.w}
    height={picture.img.h}
    {alt}
    {sizes}
    {loading}
    {decoding}
    {fetchpriority}
    {...$$restProps}
  />
</picture>
