<script>
  // Self-hosted fonts (same weights the old Google Fonts link served) so the
  // first paint doesn't block on a third-party stylesheet. The 300 weight —
  // the headings/LCP font — is declared inline below with font-display:
  // optional instead, so the largest element never swap-repaints.
  import '@fontsource/cormorant-garamond/400.css';
  import '@fontsource/cormorant-garamond/500.css';
  import '@fontsource/cormorant-garamond/300-italic.css';
  import '@fontsource/cormorant-garamond/400-italic.css';
  import '@fontsource/outfit/300.css';
  import '@fontsource/outfit/400.css';
  import '@fontsource/outfit/500.css';
  import '@fontsource/outfit/600.css';
  import '../app.css';
  // Preload only the hero-headline font: the H1 is the LCP element, and if
  // this file lands before first paint there is no swap repaint to push LCP
  // later. Preloading more fonts would compete with it for bandwidth.
  import cormorant300 from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-normal.woff2?url';
</script>

<svelte:head>
  <link rel="preload" as="font" type="font/woff2" crossorigin href={cormorant300} />
  {@html `<style>@font-face{font-family:'Cormorant Garamond';font-style:normal;font-weight:300;font-display:optional;src:url(${cormorant300}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}</style>`}
</svelte:head>

<slot />
