<script>
  import EnquiryForm from '$lib/components/EnquiryForm.svelte';

  const faqs = [
    {
      q: 'Can international buyers own property in Zanzibar?',
      a: 'Yes. Foreign buyers hold a long leasehold — up to 99 years, renewable — most straightforwardly inside government-approved (ZIPA) developments. A qualifying purchase (from USD 100,000) can also support an investment residence permit. We provide full legal and visa guidance for a smooth, compliant process.'
    },
    {
      q: 'Is the villa managed for me?',
      a: 'Yes. Each villa is run under a full-service hospitality model — guests, bookings, housekeeping, maintenance and revenue management are all handled for you, with regular owner reporting and distributions.'
    },
    {
      q: 'How does tourism support returns in Pongwe?',
      a: "Zanzibar's visitor numbers are climbing toward 2 million arrivals by 2026. Pongwe's calm, design-led east coast is exactly what today's premium traveller seeks, driving strong, year-round short-stay demand for private pool villas."
    },
    {
      q: 'Does Pongwe offer long-term growth?',
      a: 'Land values are projected to appreciate 30–40% as new air routes and power infrastructure complete. Owners earn income now and layer capital upside on top — income today, appreciation tomorrow.'
    },
    {
      q: 'How are my payments protected?',
      a: 'We structure purchases with the safeguards serious investors expect: independent legal and quantity-surveyor representation, segregated escrow, milestone-based payments and a foundations-first rule. Your advisors stay independent of the seller.'
    }
  ];

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
    <p class="eyebrow" style="color:var(--cream)">Pongwe · Zanzibar's East Coast</p>
    <h1 class="reveal in">Own a private pool villa on Zanzibar's calm east coast.</h1>
    <p class="lede reveal in" data-d="1">Two design-led, fully managed villas in Pongwe — built for hands-off income, owned for a lifetime of slow island mornings. From USD 90,000.</p>
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
      <div class="metric"><span class="num">USD&nbsp;90<small>k</small></span><span class="label">Starting price</span><span class="cap">Per villa, leasehold</span></div>
      <div class="metric"><span class="num">18–22<small>%</small></span><span class="label">Target gross yield</span><span class="cap">Short-stay, depending on unit &amp; season</span></div>
      <div class="metric"><span class="num">20<small>%</small></span><span class="label">Down payment</span><span class="cap">Tailored milestone payment plans</span></div>
      <div class="metric"><span class="num">30–40<small>%</small></span><span class="label">Capital appreciation</span><span class="cap">Projected land growth to 2026*</span></div>
    </div>
    <p style="text-align:center;margin:2rem 0 0;font-size:.78rem;color:rgba(252,248,239,.55);letter-spacing:.04em">*Depending on unit type &amp; market conditions. Source: RE/MAX Tanzania Insider Report 2025/6.</p>
  </div>
</section>

<!-- 04 · AVAILABLE VILLAS -->
<section class="section-pad" id="villas">
  <div class="wrap">
    <div class="reveal" style="max-width:680px">
      <p class="eyebrow">Discover our two villas</p>
      <h2>Two villas, one quiet coast.</h2>
      <p class="lede" style="margin-top:1.4rem">Two near-identical villas on their own walled plots — take one as a private escape, or both as a managed pair.</p>
    </div>
    <div class="villa-grid">
      <a class="villa-card reveal" href="/villa-a" data-d="1">
        <img src="/assets/img/interior-lamp.jpg" alt="Villa A — open-plan living and dining" />
        <div class="vc-body">
          <h3>Villa A — Pongwe</h3>
          <p class="vc-meta">1,107 m² plot · 146 m² built-up · 2 bedrooms</p>
          <div class="vc-foot">
            <span class="vc-from"><small>From</small><b>USD 90,000</b></span>
            <span class="vc-arrow">→</span>
          </div>
        </div>
      </a>
      <a class="villa-card reveal" href="/villa-b" data-d="2">
        <img src="/assets/img/interior-application.jpg" alt="Villa B — terrace framed by lush planting" />
        <div class="vc-body">
          <h3>Villa B — Pongwe</h3>
          <p class="vc-meta">1,101 m² plot · 146 m² built-up · 2 bedrooms</p>
          <div class="vc-foot">
            <span class="vc-from"><small>From</small><b>USD 94,000</b></span>
            <span class="vc-arrow">→</span>
          </div>
        </div>
      </a>
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
  <div class="wrap" style="margin-top:clamp(2.4rem,5vw,4rem)">
    <div class="spec-grid reveal">
      <div class="spec"><svg class="s-ic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M4 22v-6a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v6M4 26v-4h24v4M8 12V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" /></svg><span class="s-k">Bedrooms</span><span class="s-v">2, garden-facing</span></div>
      <div class="spec"><svg class="s-ic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="24" height="18" rx="2" /><path d="M4 14h24M11 8v6" /></svg><span class="s-k">Living</span><span class="s-v">42 m² open-plan</span></div>
      <div class="spec"><svg class="s-ic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="20" height="20" rx="2" /><path d="M6 18h20M13 6v6M19 6v6" /></svg><span class="s-k">Kitchen / dining</span><span class="s-v">31 m², island</span></div>
      <div class="spec"><svg class="s-ic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20c3 0 3 2 6.5 2s3.5-2 6.5-2 3 2 6.5 2 3.5-2 6.5-2M3 26c3 0 3 2 6.5 2s3.5-2 6.5-2 3 2 6.5 2 3.5-2 6.5-2M10 16V8a3 3 0 0 1 6 0" /></svg><span class="s-k">Pool</span><span class="s-v">Private, sun deck</span></div>
      <div class="spec"><svg class="s-ic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 5 4 14h24L16 5zM7 14c2 4 2 9 0 0M16 14c0 3 0 6 0 0M25 14c-2 4-2 9 0 0M6 26h20" /></svg><span class="s-k">Roof</span><span class="s-v">Makuti-style thatch</span></div>
      <div class="spec"><svg class="s-ic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="22" height="22" rx="1" /><path d="M5 12h22M12 5v22" /></svg><span class="s-k">Plot</span><span class="s-v">≈ 1,100 m², walled</span></div>
    </div>
  </div>
</section>

<!-- 08 · FEATURES -->
<section class="section-pad" id="features" style="background:var(--sand)">
  <div class="wrap">
    <div class="reveal" style="max-width:620px">
      <p class="eyebrow">Details that elevate every day</p>
      <h2>Villa features.</h2>
    </div>
    <div class="features-grid reveal">
      <div class="feature"><svg class="f-ic" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M3 17c2.5 0 2.5 1.6 5 1.6S10.5 17 13 17s2.5 1.6 5 1.6S20.5 17 23 17M3 22c2.5 0 2.5 1.6 5 1.6S10.5 22 13 22s2.5 1.6 5 1.6S20.5 22 23 22M8 13V7a3 3 0 0 1 6 0" /></svg><span>Private swimming pool &amp; sun-deck terrace</span></div>
      <div class="feature"><svg class="f-ic" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="20" height="20" rx="1" /><path d="M14 4v20M4 14h20" /></svg><span>Full-height sliding glass to the garden</span></div>
      <div class="feature"><svg class="f-ic" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4 4 12h20L14 4zM6 22h16" /><path d="M7 12v10M14 12v10M21 12v10" /></svg><span>Makuti-thatched roof on treated timber</span></div>
      <div class="feature"><svg class="f-ic" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="18" height="18" rx="1" /><path d="M5 15h18M11 5v5M16 5v5" /></svg><span>Open-plan island kitchen</span></div>
      <div class="feature"><svg class="f-ic" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3 5 14h6l-1 11 9-14h-6z" /></svg><span>On-plot parking &amp; back-up power (genset)</span></div>
      <div class="feature"><svg class="f-ic" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="20" height="20" rx="1" /><path d="M4 4v20M24 4v20" /></svg><span>Walled, private grounds — room to breathe</span></div>
    </div>
  </div>
</section>

<!-- 09 · PATH TO OWNERSHIP -->
<section class="path section-pad" id="ownership">
  <div class="wrap">
    <div class="reveal" style="max-width:620px">
      <p class="eyebrow">Your path to ownership</p>
      <h2>Four steps to island income.</h2>
    </div>
    <div class="steps">
      <div class="step reveal"><span class="dot"></span><span class="st-n">01</span><h3>Choose your villa</h3><p>Select Villa A, Villa B, or both — designed for resort-grade living and strong rental performance.</p></div>
      <div class="step reveal" data-d="1"><span class="dot"></span><span class="st-n">02</span><h3>Reserve with a deposit</h3><p>Secure your villa with a 20% deposit that confirms availability and locks today's pricing.</p></div>
      <div class="step reveal" data-d="2"><span class="dot"></span><span class="st-n">03</span><h3>Pay to milestones</h3><p>Payments release against certified construction milestones — a clear, manageable structure throughout the build.</p></div>
      <div class="step reveal" data-d="3"><span class="dot"></span><span class="st-n">04</span><h3>Earn, hands-free</h3><p>On completion your villa joins the managed rental pool, generating income with regular owner distributions.</p></div>
    </div>
  </div>
</section>

<!-- 10 · FAQ -->
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

<!-- 11a · CLOSING CTA -->
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

<!-- 11b · ENQUIRY -->
<section class="enquire section-pad" id="enquire">
  <div class="wrap enquire-grid">
    <div class="reveal">
      <p class="eyebrow">Start the conversation</p>
      <h2 style="color:var(--cream)">Enquire about Guri Pongwe.</h2>
      <p style="color:rgba(252,248,239,.82);margin-top:1.2rem;max-width:36ch">Tell us a little about what you're looking for and our team will be in touch with pricing, floor plans and availability.</p>
      <div class="contact-line">
        <a href="mailto:hello@guriescapes.com"><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg> hello@guriescapes.com</a>
        <a href="tel:+255000000000"><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg> +255 ___ ___ ___</a>
        <a href="https://wa.me/255000000000"><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21l1.6-5A8.5 8.5 0 1 1 8 19.4z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5M9 9.5c0-.6.4-1 1-1s1 1 1.4 1.8M14.5 15c.6 0 1-.4 1-1s-1-1-1.8-1.4" /></svg> WhatsApp · start chat</a>
      </div>
    </div>
    <div class="reveal" data-d="1">
      <EnquiryForm source="home" defaultInterest="The full brochure & pricing" />
    </div>
  </div>
</section>
