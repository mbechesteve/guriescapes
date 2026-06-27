<script>
  import { onMount } from 'svelte';

  let scrolled = false;
  let menuOpen = false;

  const links = [
    { href: '/#villas', label: 'The Villas' },
    { href: '/#invest', label: 'Why Pongwe' },
    { href: '/#ownership', label: 'Ownership' },
    { href: '/#faq', label: 'FAQ' }
  ];

  function onScroll() {
    scrolled = window.scrollY > 40;
  }

  function setMenu(open) {
    menuOpen = open;
    document.body.classList.toggle('nav-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  const toggleMenu = () => setMenu(!menuOpen);
  const closeMenu = () => menuOpen && setMenu(false);

  function onKey(e) {
    if (e.key === 'Escape') closeMenu();
  }

  onMount(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('nav-open');
      document.body.style.overflow = '';
    };
  });
</script>

<header class="site-header" class:scrolled>
  <a href="/" aria-label="Guri Escapes home">
    <img src="/assets/img/logo-cream.png" alt="Guri Escapes" class="brand-logo logo-cream" />
  </a>
  <nav class="nav" aria-label="Primary">
    <button
      class="menu-toggle"
      class:active={menuOpen}
      on:click={toggleMenu}
      aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={menuOpen}
    >
      <span></span><span></span><span></span>
    </button>

    <div class="nav-links" class:open={menuOpen}>
      {#each links as l}
        <a href={l.href} on:click={closeMenu}>{l.label}</a>
      {/each}
      <a href="/#enquire" class="btn btn-primary" on:click={closeMenu}>Enquire now</a>

      <div class="menu-foot">
        <div class="rule"></div>
        <a class="mail" href="mailto:hello@guriescapes.com">hello@guriescapes.com</a>
        <div class="socials">
          <a href="https://instagram.com/guriescapes" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
          </a>
          <a href="https://facebook.com/guriescapes" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 8h-2a2 2 0 0 0-2 2v12M8 13h6" /></svg>
          </a>
        </div>
      </div>
    </div>
  </nav>
</header>
