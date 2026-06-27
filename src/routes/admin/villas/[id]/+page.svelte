<script>
  import { enhance } from '$app/forms';
  import AdminBar from '$lib/components/AdminBar.svelte';
  export let data;
  export let form;

  const v = data.villa;
  let name = v.name, slug = v.slug, order = v.order, published = v.published;
  let priceFrom = v.priceFrom, plotM2 = v.plotM2, builtUpM2 = v.builtUpM2, bedrooms = v.bedrooms;
  let tagline = v.tagline, heroImage = v.heroImage, cardImage = v.cardImage;
  let introText = (v.intro || []).join('\n\n');
  let spec = (v.spec || []).map((x) => ({ ...x }));
  let gallery = (v.gallery || []).map((x) => ({ ...x }));

  let saving = false, saved = false, payload = '';
  let busy = '';

  const addSpec = () => (spec = [...spec, { k: '', v: '' }]);
  const removeSpec = (i) => (spec = spec.filter((_, x) => x !== i));
  const removeImg = (i) => (gallery = gallery.filter((_, x) => x !== i));
  const moveImg = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= gallery.length) return;
    const g = [...gallery];
    [g[i], g[j]] = [g[j], g[i]];
    gallery = g;
  };

  async function upload(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      const t = await res.json().catch(() => ({}));
      throw new Error(t.message || 'Upload failed');
    }
    return (await res.json()).url;
  }
  async function pick(e, assign, key) {
    const f = e.target.files?.[0];
    if (!f) return;
    busy = key;
    try {
      assign(await upload(f));
    } catch (err) {
      alert(err.message);
    } finally {
      busy = '';
      e.target.value = '';
    }
  }

  let galUrl = '';
  function addGalleryUrl() {
    if (galUrl.trim()) {
      gallery = [...gallery, { src: galUrl.trim(), alt: '' }];
      galUrl = '';
    }
  }

  function onSubmit() {
    payload = JSON.stringify({
      name, slug, order, published, priceFrom, plotM2, builtUpM2, bedrooms, tagline, heroImage, cardImage,
      intro: introText.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean),
      spec, gallery
    });
    saving = true;
    return async ({ update }) => {
      await update({ reset: false });
      saving = false;
      saved = true;
      setTimeout(() => (saved = false), 2500);
    };
  }
</script>

<svelte:head><title>{name || 'Villa'} · Guri Escapes Admin</title></svelte:head>

<div class="adm-page">
  <AdminBar />
  <main class="adm-wrap">
    <p style="margin:0 0 0.5rem"><a href="/admin/villas" style="color:var(--wood);text-decoration:none;font-size:.88rem">← All villas</a></p>
    <h1 class="adm-h1">Edit villa</h1>

    <form method="POST" use:enhance={onSubmit}>
      <input type="hidden" name="payload" value={payload} />

      <section class="adm-section">
        <h2>Basics</h2>
        <div class="adm-field"><label>Name</label><input bind:value={name} placeholder="Villa C — Pongwe" /></div>
        <div class="adm-row">
          <div class="adm-field"><label>URL slug (the page address: /slug)</label><input bind:value={slug} placeholder="villa-c" /></div>
          <div class="adm-field"><label>Sort order</label><input type="number" bind:value={order} /></div>
        </div>
        <div class="adm-field" style="flex-direction:row;align-items:center;gap:.6rem">
          <input id="pub" type="checkbox" bind:checked={published} style="width:auto" />
          <label for="pub" style="margin:0">Published (visible on the site)</label>
        </div>
        <div class="adm-field"><label>Tagline (heading on the villa page)</label><input bind:value={tagline} /></div>
      </section>

      <section class="adm-section">
        <h2>Facts &amp; price</h2>
        <div class="adm-row3">
          <div class="adm-field"><label>Plot (m²)</label><input bind:value={plotM2} placeholder="1,100" /></div>
          <div class="adm-field"><label>Built-up (m²)</label><input bind:value={builtUpM2} placeholder="146" /></div>
          <div class="adm-field"><label>Bedrooms</label><input bind:value={bedrooms} placeholder="2" /></div>
        </div>
        <div class="adm-field"><label>Price from (shown as “From USD …”)</label><input bind:value={priceFrom} placeholder="90,000" /></div>
      </section>

      <section class="adm-section">
        <h2>Description</h2>
        <div class="adm-field">
          <label>Intro paragraphs (separate paragraphs with a blank line)</label>
          <textarea rows="6" bind:value={introText}></textarea>
        </div>
      </section>

      <section class="adm-section">
        <h2>Images</h2>
        <div class="adm-row">
          <div class="adm-field">
            <label>Hero image (top of villa page)</label>
            {#if heroImage}<img class="adm-thumb" src={heroImage} alt="Hero" style="margin-bottom:.5rem" />{/if}
            <input bind:value={heroImage} placeholder="https://… or upload" />
            <label class="adm-btn ghost sm" style="margin-top:.4rem;display:inline-block;cursor:pointer">
              {busy === 'hero' ? 'Uploading…' : 'Upload'}
              <input type="file" accept="image/*" hidden on:change={(e) => pick(e, (u) => (heroImage = u), 'hero')} />
            </label>
          </div>
          <div class="adm-field">
            <label>Card image (homepage grid)</label>
            {#if cardImage}<img class="adm-thumb" src={cardImage} alt="Card" style="margin-bottom:.5rem" />{/if}
            <input bind:value={cardImage} placeholder="defaults to hero image" />
            <label class="adm-btn ghost sm" style="margin-top:.4rem;display:inline-block;cursor:pointer">
              {busy === 'card' ? 'Uploading…' : 'Upload'}
              <input type="file" accept="image/*" hidden on:change={(e) => pick(e, (u) => (cardImage = u), 'card')} />
            </label>
          </div>
        </div>
      </section>

      <section class="adm-section">
        <h2>Gallery</h2>
        <div class="gal-grid">
          {#each gallery as g, i}
            <div class="gal-item">
              <img class="adm-thumb" src={g.src} alt={g.alt} />
              <input class="gal-alt" bind:value={g.alt} placeholder="Caption / alt text" />
              <div class="gal-actions">
                <button type="button" class="adm-btn ghost sm" on:click={() => moveImg(i, -1)} disabled={i === 0}>←</button>
                <button type="button" class="adm-btn ghost sm" on:click={() => moveImg(i, 1)} disabled={i === gallery.length - 1}>→</button>
                <button type="button" class="adm-del" on:click={() => removeImg(i)}>Remove</button>
              </div>
            </div>
          {/each}
        </div>
        <div class="gal-add">
          <label class="adm-btn ghost sm" style="cursor:pointer">
            {busy === 'gal' ? 'Uploading…' : '+ Upload image'}
            <input type="file" accept="image/*" hidden on:change={(e) => pick(e, (u) => (gallery = [...gallery, { src: u, alt: '' }]), 'gal')} />
          </label>
          <input bind:value={galUrl} placeholder="…or paste an image URL" style="flex:1;min-width:160px" class="gal-urlin" />
          <button type="button" class="adm-btn ghost sm" on:click={addGalleryUrl}>Add URL</button>
        </div>
      </section>

      <section class="adm-section">
        <h2>Specification</h2>
        {#each spec as sp, i}
          <div class="adm-row" style="align-items:end">
            <div class="adm-field"><label>Label</label><input bind:value={sp.k} placeholder="Pool" /></div>
            <div class="adm-field" style="position:relative">
              <label>Value</label><input bind:value={sp.v} placeholder="Private, sun deck" />
            </div>
            <button type="button" class="adm-del" style="margin-bottom:1rem" on:click={() => removeSpec(i)}>Remove</button>
          </div>
        {/each}
        <button type="button" class="adm-btn ghost sm" on:click={addSpec}>+ Add spec</button>
      </section>

      {#if form?.error}<p style="color:#a3432b">{form.error}</p>{/if}
      <div class="adm-savebar">
        <button type="submit" class="adm-btn" disabled={saving}>{saving ? 'Saving…' : 'Save villa'}</button>
        {#if saved}<span class="adm-ok">Saved ✓ — live on the site.</span>{/if}
        <a class="adm-btn ghost sm" href={`/${slug}`} target="_blank" rel="noreferrer" style="margin-left:auto">Preview ↗</a>
      </div>
    </form>
  </main>
</div>

<style>
  .gal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.9rem; margin-bottom: 1rem; }
  .gal-item { border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem; background: var(--cream); }
  .gal-alt { width: 100%; box-sizing: border-box; margin-top: 0.5rem; font-size: 0.82rem; border: 1px solid var(--line); border-radius: 6px; padding: 0.4em 0.5em; background: #fff; }
  .gal-actions { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.5rem; }
  .gal-add { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; }
  .gal-urlin { font-size: 0.88rem; border: 1px solid var(--line); border-radius: 8px; padding: 0.55em 0.7em; background: var(--cream); }
</style>
