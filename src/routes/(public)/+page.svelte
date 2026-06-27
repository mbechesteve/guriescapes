<script>
  import EnquiryForm from '$lib/components/EnquiryForm.svelte';
  export let data;

  $: hero = data.site.hero;
  $: metrics = data.site.metrics || [];
  $: contact = data.site.contact || {};
  $: faqs = data.site.faq || [];
  $: villas = data.villas || [];
  $: waHref = contact.whatsapp ? `https://wa.me/${contact.whatsapp}` : '#';
  $: interestOptions = [...villas.map((v) => v.name), 'Both villas (managed pair)', 'The full brochure & pricing'];

  let openFaq = null;
  const toggleFaq = (i) => (openFaq = openFaq === i ? null : i);
</script>

<svelte:head>
  <title>Guri Escapes Pongwe — Private Pool Villas in Zanzibar</title>
  <meta name="description" content="Own a design-led, fully managed private pool villa on Zanzibar's calm east coast. Two contemporary villas in Pongwe — built for hands-off income, owned for a lifetime of slow island mornings." />
</svelte:head>

<!-- 01 · HERO -->
<section class="hero" id="top">
  <div class="hero-bg"><img src="/assets/img/hero.jpg" alt="A villa interior opening onto golden-hour island light" /></div>
  <img class="hero-frond" src="/assets/img/frond.svg" alt="" aria-hidden="true" />
  <div class="wrap hero-inner">
    <p class="eyebrow" style="color:var(--cream)">{hero.eyebrow}</p>
    <h1 class="reveal in">{hero.headline}</h1>
    <p class="lede reveal in" data-d="1">{hero.sub}{#if hero.priceFrom} From USD {hero.priceFrom}.{/if}</p>
    <div class="hero-cta reveal in" data-d="2">
      <a href="#enquire" class="btn btn-primary btn-lg">Enquire now <span class="arrow">→</span></a>
      <a href="#enquire" class="btn btn-ghost btn-lg on-dark">Download brochure</a>
    </div>
  </div>
  <a href="#story" class="scroll-cue" aria-label="Scroll to explore">
    <span class="sc-label">Scroll to explore</span>
    <span class="sc-track"><span class="sc-dot"></span></span>
  </a>
</section>

<!-- 02 · LIFESTYLE INTRO -->
<section class="section-pad" id="story">
  <div class="wrap split">
    <div class="reveal">
      <p class="eyebrow">Discover an effortless island life</p>
      <h2>Slow down.<br />You have arrived.</h2>
      <p class="lede" style="margin-top:1.6rem">Guri Escapes Pongwe is a pair of contemporary villas on the quiet, reef-sheltered east coast of Zanzibar. Each pairs a private pool and makuti-thatched roof with open, light-filled living — a place that feels, from the first deep breath, unhurried, natural and quietly luxurious.</p>
      <p>Designed for couples and remote professionals who value calm and privacy over crowds, and structured so it earns its keep while you're away.</p>
      <a href="#enquire" class="btn btn-ghost" style="margin-top:.8rem">Enquire now <span class="arrow">→</span></a>
    </div>
    <div class="split-media reveal" data-d="1">
      <img src="/assets/img/lifestyle-hammock.jpg" alt="A hammock strung between palms in dappled island light" />
      <span class="tag">Pongwe · slow mornings</span>
    </div>
  </div>
</section>

<!-- 03 · KEY NUMBERS -->
<section class="metrics" aria-label="The numbers at a glance">
  <img class="frond-wm" src="/assets/img/frond.svg" alt="" aria-hidden="true" />
  <div class="wrap" style="padding-top:clamp(56px,7vw,90px);padding-bottom:1.4rem">
    <p class="eyebrow center reveal" style="display:flex;justify-content:center">The numbers, at a glance</p>
  </div>
  <div class="wrap" style="padding-bottom:clamp(56px,7vw,90px)">
    <div class="metrics-grid reveal">
      {#each metrics as m}
        <div class="metric"><span class="num">{m.num}</span><span class="label">{m.label}</span><span class="cap">{m.cap}</span></div>
      {/each}
    </div>
    <p style="text-align:center;margin:2rem 0 0;font-size:.78rem;color:rgba(252,248,239,.55);letter-spacing:.04em">*Depending on unit type &amp; market conditions. Source: RE/MAX Tanzania Insider Report 2025/6.</p>
  </div>
</section>

<!-- 04 · AVAILABLE VILLAS -->
<section class="section-pad" id="villas">
  <div class="wrap">
    <div class="reveal" style="max-width:680px">
      <p class="eyebrow">Discover our villas</p>
      <h2>{villas.length === 1 ? 'One quiet coast.' : 'Villas on one quiet coast.'}</h2>
      <p class="lede" style="margin-top:1.4rem">Design-led villas on their own walled plots — take one as a private escape, or several as a managed group.</p>
    </div>
    <div class="villa-grid">
      {#each villas as v, i}
        <a class="villa-card reveal" href="/{v.slug}" data-d={i + 1}>
          <img src={v.cardImage} alt={v.name} />
          <div class="vc-body">
            <h3>{v.name}</h3>
            <p class="vc-meta">{v.plotM2} m² plot · {v.builtUpM2} m² built-up · {v.bedrooms} bedrooms</p>
            <div class="vc-foot">
              <span class="vc-from"><small>From</small><b>USD {v.priceFrom}</b></span>
              <span class="vc-arrow">→</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- 05 · MANAGED MODEL -->
<section class="section-pad" id="managed" style="background:var(--sand)">
  <div class="wrap">
    <div class="reveal" style="max-width:680px">
      <p class="eyebrow">A world of effortless ownership</p>
      <h2>We handle the guests. You receive the returns.</h2>
      <p class="lede" style="margin-top:1.4rem">Your villa is run under a professional hospitality model — so ownership stays effortless and income stays hands-off.</p>
    </div>
    <div class="pillars">
      <div class="pillar reveal" data-d="1">
        <svg class="p-ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 40V20l16-10 16 10v20" /><path d="M18 40V28h12v12" /><path d="M6 40h36" /></svg>
        <h3>Hotel-grade operations</h3>
        <p>Professional, hotel-style operations and attentive guest services from arrival to checkout.</p>
      </div>
      <div class="pillar reveal" data-d="2">
        <svg class="p-ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M24 6v36M10 14l28 20M38 14L10 34" /><circle cx="24" cy="24" r="20" /></svg>
        <h3>Reservations &amp; revenue</h3>
        <p>Centralised reservations, marketing and revenue management that keep occupancy high year-round.</p>
      </div>
      <div class="pillar reveal" data-d="3">
        <svg class="p-ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M30 8l10 10-22 22-10 2 2-10z" /><path d="M26 12l10 10" /></svg>
        <h3>Maintenance &amp; care</h3>
        <p>Maintenance, housekeeping and quality control — the villa kept guest-ready, always.</p>
      </div>
    </div>
  </div>
</section>

<!-- 06 · WHY INVEST -->
<section class="invest section-pad" id="invest">
  <div class="invest-bg"><img src="/assets/img/beach-palm.jpg" alt="" /></div>
  <div class="wrap">
    <div class="reveal" style="max-width:680px">
      <p class="eyebrow">Why invest in Pongwe</p>
      <h2 style="color:var(--cream)">The headline performer in East African property.</h2>
    </div>
    <div class="invest-stats">
      <div class="invest-stat reveal"><div class="num">18–22%</div><div class="lab">ROI potential</div><div class="cap">Target gross yields for Zanzibar villas — best in the region.</div></div>
      <div class="invest-stat reveal" data-d="1"><div class="num">65%+</div><div class="lab">Occupancy</div><div class="cap">Island-wide and rising with record tourism.</div></div>
      <div class="invest-stat reveal" data-d="2"><div class="num">30–40%</div><div class="lab">Capital growth</div><div class="cap">Projected land appreciation to 2026.</div></div>
      <div class="invest-stat reveal" data-d="3"><div class="num">100%</div><div class="lab">International buyers</div><div class="cap">Secure leasehold structure built for foreign owners.</div></div>
    </div>
    <p class="invest-note reveal">Tourist arrivals are on track to surpass 2 million by 2026 — and villas earn in USD, a natural hedge against currency movement.</p>
  </div>
</section>

<!-- 07 · INSIDE THE VILLA -->
<section class="section-pad" id="inside">
  <div class="wrap split flip">
    <div class="split-media reveal">
      <img src="/assets/img/interior-lamp.jpg" alt="Open-plan living and dining beneath woven pendant lights" />
      <span class="tag">Open-plan living · 42 m²</span>
    </div>
    <div class="reveal" data-d="1">
      <p class="eyebrow">Where comfort meets nature</p>
      <h2>Inside the villa.</h2>
      <p class="lede" style="margin-top:1.4rem">Single-storey and open-plan, each villa runs the lounge and kitchen the full width of the home, then dissolves into the pool terrace through full-height sliding glass.</p>
      <p>Two quiet, garden-facing bedrooms sit to one side. High ceilings, shaded verandas and cross-ventilation keep it naturally cool — lower running costs, a better guest experience.</p>
    </div>
  </div>
</section>

<!-- 08 · FAQ -->
<section class="section-pad" id="faq">
  <div class="wrap">
    <div class="reveal" style="max-width:620px">
      <p class="eyebrow">Answers to your questions</p>
      <h2>Good to know.</h2>
    </div>
    <div class="faq-wrap reveal">
      {#each faqs as f, i}
        <div class="faq" class:open={openFaq === i}>
          <button aria-expanded={openFaq === i} on:click={() => toggleFaq(i)}>
            <span>{f.q}</span><span class="ic" aria-hidden="true"></span>
          </button>
          <div class="ans" style:max-height={openFaq === i ? '600px' : '0'}>
            <p>{f.a}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- 09 · CLOSING CTA -->
<section class="closing section-pad" id="brochure">
  <div class="closing-bg"><img src="/assets/img/pool.jpg" alt="" /></div>
  <div class="wrap reveal">
    <p class="eyebrow center" style="justify-content:center">Experience an escape</p>
    <h2>Discover your next Zanzibar investment.</h2>
    <p>Reserve a villa, or download the full brochure with pricing and floor plans.</p>
    <div class="hero-cta">
      <a href="#enquire" class="btn btn-primary btn-lg">Enquire now <span class="arrow">→</span></a>
      <a href="#enquire" class="btn btn-ghost btn-lg on-dark">Download brochure</a>
    </div>
  </div>
</section>

<!-- 10 · ENQUIRY -->
<section class="enquire section-pad" id="enquire">
  <div class="wrap enquire-grid">
    <div class="reveal">
      <p class="eyebrow">Start the conversation</p>
      <h2 style="color:var(--cream)">Enquire about Guri Pongwe.</h2>
      <p style="color:rgba(252,248,239,.82);margin-top:1.2rem;max-width:36ch">Tell us a little about what you're looking for and our team will be in touch with pricing, floor plans and availability.</p>
      <div class="contact-line">
        <a href={`mailto:${contact.email}`}><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg> {contact.email}</a>
        <a href={`tel:${contact.phone}`}><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg> {contact.phone}</a>
        <a href={waHref}><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21l1.6-5A8.5 8.5 0 1 1 8 19.4z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5M9 9.5c0-.6.4-1 1-1s1 1 1.4 1.8M14.5 15c.6 0 1-.4 1-1s-1-1-1.8-1.4" /></svg> WhatsApp · start chat</a>
      </div>
    </div>
    <div class="reveal" data-d="1">
      <EnquiryForm source="home" interests={interestOptions} defaultInterest="The full brochure & pricing" />
    </div>
  </div>
</section>
