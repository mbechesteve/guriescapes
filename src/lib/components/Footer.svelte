<script>
  import { page } from '$app/stores';
  $: c = $page.data?.site?.contact ?? {};
  $: wa = c.whatsapp ? `https://wa.me/${c.whatsapp}` : '#';
</script>

<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div>
        <img src="/assets/img/logo-cream.png" alt="Guri Escapes" class="footer-logo" />
        <p class="f-blurb">Design-led pool villas on Zanzibar's east coast. Built for calm, owned for income; tropical living with serious ROI potential.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <nav class="footer-links" aria-label="Footer">
          <a href="/#story">The lifestyle</a>
          <a href="/#villas">The villas</a>
          <a href="/#invest">Why Pongwe</a>
          <a href="/#ownership">Path to ownership</a>
          <a href="/#faq">FAQ</a>
        </nav>
      </div>
      <div>
        <h4>Get in touch</h4>
        <nav class="footer-links" aria-label="Contact">
          <a href={`mailto:${c.email || 'hello@guriescapes.com'}`}>{c.email || 'hello@guriescapes.com'}</a>
          <a href={`tel:${c.phone || ''}`}>{c.phone || '+255 ___ ___ ___'}</a>
          <a href={wa}>WhatsApp · start chat</a>
          <a href="/#enquire">Enquire now</a>
        </nav>
        <div class="footer-social" style="margin-top:1.4rem">
          {#if c.instagram}<a href={c.instagram} aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>{/if}
          {#if c.facebook}<a href={c.facebook} aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 8h-2a2 2 0 0 0-2 2v12M8 13h6" /></svg></a>{/if}
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span style="font-size:.85rem">© 2026 Guri Escapes Pongwe · www.guriescapes.com</span>
      <span style="font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold)">Experience an escape</span>
    </div>
    <p class="legal">This presentation is for informational and marketing purposes only and does not constitute a binding offer. Floor plans and unit sizes follow the architectural concept and may be subject to modification in final design. Yield, occupancy and appreciation figures are directional, drawn from RE/MAX Tanzania market reporting, and are not a guarantee of individual return.</p>
  </div>
</footer>
