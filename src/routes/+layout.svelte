<script>
  // Self-hosted fonts (same weights the old Google Fonts link served) so the
  // first paint doesn't block on a third-party stylesheet.
  import '@fontsource/cormorant-garamond/300.css';
  import '@fontsource/cormorant-garamond/400.css';
  import '@fontsource/cormorant-garamond/500.css';
  import '@fontsource/cormorant-garamond/300-italic.css';
  import '@fontsource/cormorant-garamond/400-italic.css';
  import '@fontsource/outfit/300.css';
  import '@fontsource/outfit/400.css';
  import '@fontsource/outfit/500.css';
  import '@fontsource/outfit/600.css';
  import '../app.css';
</script>

<slot />
