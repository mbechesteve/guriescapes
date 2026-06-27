<script>
  import Gallery from '$lib/components/Gallery.svelte';
  import EnquiryForm from '$lib/components/EnquiryForm.svelte';
  export let data;

  $: v = data.villa;
  $: contact = data.site?.contact ?? {};
  $: wa = contact.whatsapp ? `https://wa.me/${contact.whatsapp}` : '#';
  // second image for the intro split, falling back to the hero image
  $: splitImage = (v.gallery && v.gallery[1]?.src) || v.heroImage;
</script>

<svelte:head>
  <title>{v.name} — Guri Escapes Pongwe</title>
  <meta name="description" content={`${v.name} at Guri Escapes Pongwe — ${v.bedrooms}-bedroom private pool villa on a ${v.plotM2} m² walled plot, Zanzibar's east coast.`} />
</svelte:head>

<section class="page-hero">
  <img class="ph-bg" src={v.heroImage} alt={v.name} />
  <div class="wrap ph-inner">
    <p class="crumb"><a href="/">Home</a> / <a href="/#villas">Villas</a> / {v.name}</p>
    <h1>{v.name}</h1>
    <div class="plot-facts">
      <div><div class="pf-k">Plot</div><div class="pf-v">{v.plotM2} m²</div></div>
      <div><div class="pf-k">Built-up</div><div class="pf-v">{v.builtUpM2} m²</div></div>
      <div><div class="pf-k">Bedrooms</div><div class="pf-v">{v.bedrooms}</div></div>
      <div><div class="pf-k">From</div><div class="pf-v">USD {v.priceFrom}</div></div>
    </div>
  </div>
</section>

<section class="section-pad">
  <div class="wrap split">
    <div class="reveal">
      <p class="eyebrow">The villa</p>
      <h2>{v.tagline}</h2>
      {#each v.intro as para, i}
        <p class={i === 0 ? 'lede' : ''} style={i === 0 ? 'margin-top:1.4rem' : ''}>{para}</p>
      {/each}
      <a href="#enquire" class="btn btn-primary" style="margin-top:.6rem">Enquire about {v.name.split(' — ')[0]} <span class="arrow">→</span></a>
    </div>
    <div class="split-media reveal" data-d="1">
      <img src={splitImage} alt={v.name} />
      <span class="tag">Pool terrace</span>
    </div>
  </div>
</section>

{#if v.gallery && v.gallery.length}
  <section class="section-pad" style="padding-top:0">
    <div class="wrap">
      <div class="reveal" style="max-width:560px"><p class="eyebrow">Gallery</p><h2>A closer look.</h2></div>
      <Gallery images={v.gallery} />
    </div>
  </section>
{/if}

{#if v.spec && v.spec.length}
  <section class="section-pad" style="background:var(--sand)">
    <div class="wrap">
      <div class="reveal" style="max-width:560px"><p class="eyebrow">Specification</p><h2>The essentials.</h2></div>
      <div class="spec-grid reveal">
        {#each v.spec as s}
          <div class="spec"><span class="s-k">{s.k}</span><span class="s-v">{s.v}</span></div>
        {/each}
      </div>
      <p style="margin-top:2rem;font-size:.86rem;color:var(--ink-soft)">Floor plan available on request — included in the full brochure. Unit sizes follow the architectural concept and may be subject to modification in final design.</p>
    </div>
  </section>
{/if}

<section class="enquire section-pad" id="enquire">
  <div class="wrap enquire-grid">
    <div class="reveal">
      <p class="eyebrow">Enquire</p>
      <h2 style="color:var(--cream)">Reserve {v.name.split(' — ')[0]}.</h2>
      <p style="color:rgba(252,248,239,.82);margin-top:1.2rem;max-width:36ch">Secure today's pricing with a 20% deposit, or request the full brochure with floor plans. Our team will be in touch shortly.</p>
      <div class="contact-line">
        <a href={`mailto:${contact.email}`}><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg> {contact.email}</a>
        <a href={wa}><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21l1.6-5A8.5 8.5 0 1 1 8 19.4z" /></svg> WhatsApp · start chat</a>
      </div>
    </div>
    <div class="reveal" data-d="1">
      <EnquiryForm source={v.slug} defaultInterest={v.name} interests={[v.name, 'Both villas (managed pair)', 'The full brochure & pricing']} />
    </div>
  </div>
</section>
