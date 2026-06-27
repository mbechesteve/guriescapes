<script>
  import Gallery from '$lib/components/Gallery.svelte';
  import EnquiryForm from '$lib/components/EnquiryForm.svelte';

  const gallery = [
    { src: '/assets/img/interior-lamp.jpg', alt: 'Open-plan living and dining', wide: true },
    { src: '/assets/img/lifestyle-hammock.jpg', alt: 'Hammock in the garden' },
    { src: '/assets/img/interior-application.jpg', alt: 'Terrace framed by planting' },
    { src: '/assets/img/pool.jpg', alt: 'The private pool' },
    { src: '/assets/img/lounge.jpg', alt: 'Lounge corner' }
  ];
</script>

<svelte:head>
  <title>Villa A — Guri Escapes Pongwe</title>
  <meta name="description" content="Villa A at Guri Escapes Pongwe — a 2-bedroom private pool villa on a 1,107 m² walled plot, Zanzibar's east coast." />
</svelte:head>

<section class="page-hero">
  <img class="ph-bg" src="/assets/img/interior-lamp.jpg" alt="Villa A interior, open-plan living" />
  <div class="wrap ph-inner">
    <p class="crumb"><a href="/">Home</a> / <a href="/#villas">Villas</a> / Villa A</p>
    <h1>Villa A — Pongwe</h1>
    <div class="plot-facts">
      <div><div class="pf-k">Plot</div><div class="pf-v">1,107 m²</div></div>
      <div><div class="pf-k">Built-up</div><div class="pf-v">146 m²</div></div>
      <div><div class="pf-k">Bedrooms</div><div class="pf-v">2</div></div>
      <div><div class="pf-k">From</div><div class="pf-v">USD 90,000</div></div>
    </div>
  </div>
</section>

<section class="section-pad">
  <div class="wrap split">
    <div class="reveal">
      <p class="eyebrow">The villa</p>
      <h2>A private escape on its own walled plot.</h2>
      <p class="lede" style="margin-top:1.4rem">Villa A is single-storey and open-plan — the lounge and island kitchen run the full width of the home, then open onto a private pool terrace through full-height sliding glass. Two quiet, garden-facing bedrooms sit to one side.</p>
      <p>High ceilings, shaded verandas and natural cross-ventilation keep it cool without working the air-conditioning — lower running costs for you, a better stay for guests. Taken alone it's a serene bolt-hole; paired with Villa B, a turnkey managed investment.</p>
      <a href="#enquire" class="btn btn-primary" style="margin-top:.6rem">Enquire about Villa A <span class="arrow">→</span></a>
    </div>
    <div class="split-media reveal" data-d="1">
      <img src="/assets/img/hero.jpg" alt="Daybed terrace bathed in golden light" />
      <span class="tag">Pool terrace</span>
    </div>
  </div>
</section>

<section class="section-pad" style="padding-top:0">
  <div class="wrap">
    <div class="reveal" style="max-width:560px"><p class="eyebrow">Gallery</p><h2>A closer look.</h2></div>
    <Gallery images={gallery} />
  </div>
</section>

<section class="section-pad" style="background:var(--sand)">
  <div class="wrap">
    <div class="reveal" style="max-width:560px"><p class="eyebrow">Specification</p><h2>The essentials.</h2></div>
    <div class="spec-grid reveal">
      <div class="spec"><span class="s-k">Bedrooms</span><span class="s-v">2, garden-facing</span></div>
      <div class="spec"><span class="s-k">Living</span><span class="s-v">42 m² open-plan</span></div>
      <div class="spec"><span class="s-k">Kitchen / dining</span><span class="s-v">31 m², island</span></div>
      <div class="spec"><span class="s-k">Pool</span><span class="s-v">Private, sun deck</span></div>
      <div class="spec"><span class="s-k">Roof</span><span class="s-v">Makuti-style thatch</span></div>
      <div class="spec"><span class="s-k">Plot</span><span class="s-v">1,107 m², walled</span></div>
    </div>
    <p style="margin-top:2rem;font-size:.86rem;color:var(--ink-soft)">Floor plan available on request — included in the full brochure. Unit sizes follow the architectural concept and may be subject to modification in final design.</p>
  </div>
</section>

<section class="enquire section-pad" id="enquire">
  <div class="wrap enquire-grid">
    <div class="reveal">
      <p class="eyebrow">Enquire</p>
      <h2 style="color:var(--cream)">Reserve Villa A.</h2>
      <p style="color:rgba(252,248,239,.82);margin-top:1.2rem;max-width:36ch">Secure today's pricing with a 20% deposit, or request the full brochure with floor plans. Our team will be in touch shortly.</p>
      <div class="contact-line">
        <a href="mailto:hello@guriescapes.com"><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg> hello@guriescapes.com</a>
        <a href="https://wa.me/255000000000"><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21l1.6-5A8.5 8.5 0 1 1 8 19.4z" /></svg> WhatsApp · start chat</a>
      </div>
    </div>
    <div class="reveal" data-d="1">
      <EnquiryForm source="villa-a" defaultInterest="Villa A — Pongwe" />
    </div>
  </div>
</section>
