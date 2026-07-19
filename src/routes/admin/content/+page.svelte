<script>
  import { enhance } from '$app/forms';
  import AdminBar from '$lib/components/AdminBar.svelte';
  export let data;

  let hero = { ...data.hero };
  let contact = { ...data.contact };
  let metrics = (data.metrics || []).map((m) => ({ ...m }));
  let faq = (data.faq || []).map((f) => ({ ...f }));

  let developer = { eyebrow: '', heading: '', since: '', body: [], image: '', ...data.developer };
  let testimonials = (data.testimonials || []).map((t) => ({ ...t }));
  let trustBar = { zipa: '', remaxReportUrl: '', note: '', press: [], ...data.trustBar };
  let renders = (data.renders || []).map((x) => ({ ...x }));
  let floorPlans = (data.floorPlans || []).map((x) => ({ ...x }));
  let progress = (data.progress || []).map((x) => ({ ...x }));
  let availability = { reserved: '', total: '', note: '', ...data.availability };
  let brochure = { fileUrl: '', name: '', uploadedAt: null, ...data.brochure };
  let uploadingDoc = false;

  let saving = false;
  let saved = false;
  let payload = '';

  const addFaq = () => (faq = [...faq, { q: '', a: '' }]);
  const removeFaq = (i) => (faq = faq.filter((_, x) => x !== i));

  const addItem = (a) => [...a, {}];
  const rmItem = (a, i) => a.filter((_, x) => x !== i);

  async function uploadImage(ev, target, i, key = 'src') {
    const file = ev.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (res.ok) { const { url } = await res.json(); target[i][key] = url; target = target; }
    else alert('Image upload failed');
  }
  async function uploadBrochure(ev) {
    const file = ev.target.files?.[0]; if (!file) return;
    uploadingDoc = true;
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload/doc', { method: 'POST', body: fd });
    uploadingDoc = false;
    if (res.ok) { const { url, name } = await res.json(); brochure = { fileUrl: url, name, uploadedAt: new Date().toISOString() }; }
    else alert('PDF upload failed');
  }

  function onSubmit() {
    payload = JSON.stringify({ hero, contact, metrics, faq, developer, testimonials, trustBar, renders, floorPlans, progress, availability, brochure });
    saving = true;
    return async ({ update }) => {
      await update({ reset: false });
      saving = false;
      saved = true;
      setTimeout(() => (saved = false), 2500);
    };
  }
</script>

<svelte:head><title>Site content · Guri Escapes Admin</title></svelte:head>

<div class="adm-page">
  <AdminBar />
  <main class="adm-wrap">
    <h1 class="adm-h1">Site content</h1>

    <form method="POST" use:enhance={onSubmit}>
      <input type="hidden" name="payload" value={payload} />

      <section class="adm-section">
        <h2>Hero</h2>
        <div class="adm-field"><label>Eyebrow</label><input bind:value={hero.eyebrow} /></div>
        <div class="adm-field"><label>Headline</label><input bind:value={hero.headline} /></div>
        <div class="adm-field"><label>Sub-headline</label><textarea rows="2" bind:value={hero.sub}></textarea></div>
        <div class="adm-field"><label>Starting price (shown as “From USD …”)</label><input bind:value={hero.priceFrom} placeholder="90,000" /></div>
      </section>

      <section class="adm-section">
        <h2>Key numbers</h2>
        {#each metrics as m, i}
          <div class="adm-repeat">
            <div class="adm-row3">
              <div class="adm-field"><label>Figure</label><input bind:value={m.num} /></div>
              <div class="adm-field"><label>Label</label><input bind:value={m.label} /></div>
              <div class="adm-field"><label>Caption</label><input bind:value={m.cap} /></div>
            </div>
          </div>
        {/each}
      </section>

      <section class="adm-section">
        <h2>Contact</h2>
        <div class="adm-row">
          <div class="adm-field"><label>Email</label><input type="email" bind:value={contact.email} /></div>
          <div class="adm-field"><label>Phone</label><input bind:value={contact.phone} /></div>
        </div>
        <div class="adm-field"><label>WhatsApp number (digits only, e.g. 255712345678)</label><input bind:value={contact.whatsapp} /></div>
        <div class="adm-row">
          <div class="adm-field"><label>Instagram URL</label><input bind:value={contact.instagram} /></div>
          <div class="adm-field"><label>Facebook URL</label><input bind:value={contact.facebook} /></div>
        </div>
      </section>

      <section class="adm-section">
        <h2>Brochure (PDF)</h2>
        {#if brochure.fileUrl}<p><a href={brochure.fileUrl} target="_blank" rel="noopener">{brochure.name || 'Current brochure'} ↗</a></p>{/if}
        <label>Upload / replace brochure PDF <input type="file" accept="application/pdf" on:change={uploadBrochure} /></label>
        {#if uploadingDoc}<span>Uploading…</span>{/if}
      </section>

      <section class="adm-section">
        <h2>About the developer</h2>
        <div class="adm-field"><label>Eyebrow</label><input bind:value={developer.eyebrow} /></div>
        <div class="adm-field"><label>Heading</label><input bind:value={developer.heading} /></div>
        <div class="adm-field"><label>Years operating (e.g. "2 years")</label><input bind:value={developer.since} /></div>
        {#each developer.body as _, i}
          <div class="adm-field"><label>Paragraph {i + 1}</label><textarea rows="3" bind:value={developer.body[i]}></textarea></div>
        {/each}
        <button type="button" class="adm-btn ghost sm" on:click={() => (developer.body = [...developer.body, ''])}>+ Paragraph</button>
        <div class="adm-field"><label>Image URL (optional)</label><input bind:value={developer.image} /><input type="file" accept="image/*" on:change={(e)=>uploadImage(e,[developer],0,'image').then(()=>developer=developer)} /></div>
      </section>

      <section class="adm-section">
        <h2>Architectural renders</h2>
        {#each renders as r, i}
          <div class="adm-repeat">
            <div class="adm-field"><label>Image</label><input bind:value={r.src} placeholder="/api/img/…" /><input type="file" accept="image/*" on:change={(e)=>uploadImage(e,renders,i)} /></div>
            <div class="adm-field"><label>Alt text</label><input bind:value={r.alt} /></div>
            <div class="adm-field"><label>Caption</label><input bind:value={r.caption} /></div>
            <button type="button" class="adm-del" on:click={() => (renders = rmItem(renders, i))}>Remove</button>
          </div>
        {/each}
        <button type="button" class="adm-btn ghost sm" on:click={() => (renders = addItem(renders))}>+ Add render</button>
      </section>

      <section class="adm-section">
        <h2>Floor plans</h2>
        {#each floorPlans as r, i}
          <div class="adm-repeat">
            <div class="adm-field"><label>Image</label><input bind:value={r.src} /><input type="file" accept="image/*" on:change={(e)=>uploadImage(e,floorPlans,i)} /></div>
            <div class="adm-field"><label>Alt text</label><input bind:value={r.alt} /></div>
            <div class="adm-field"><label>Caption</label><input bind:value={r.caption} /></div>
            <button type="button" class="adm-del" on:click={() => (floorPlans = rmItem(floorPlans, i))}>Remove</button>
          </div>
        {/each}
        <button type="button" class="adm-btn ghost sm" on:click={() => (floorPlans = addItem(floorPlans))}>+ Add floor plan</button>
      </section>

      <section class="adm-section">
        <h2>Construction progress</h2>
        {#each progress as r, i}
          <div class="adm-repeat">
            <div class="adm-field"><label>Image</label><input bind:value={r.src} /><input type="file" accept="image/*" on:change={(e)=>uploadImage(e,progress,i)} /></div>
            <div class="adm-field"><label>Alt text</label><input bind:value={r.alt} /></div>
            <div class="adm-row"><div class="adm-field"><label>Date label</label><input bind:value={r.date} placeholder="Jul 2026" /></div><div class="adm-field"><label>Caption</label><input bind:value={r.caption} /></div></div>
            <button type="button" class="adm-del" on:click={() => (progress = rmItem(progress, i))}>Remove</button>
          </div>
        {/each}
        <button type="button" class="adm-btn ghost sm" on:click={() => (progress = addItem(progress))}>+ Add photo</button>
      </section>

      <section class="adm-section">
        <h2>Trust bar</h2>
        <div class="adm-field"><label>ZIPA registration reference</label><input bind:value={trustBar.zipa} /></div>
        <div class="adm-field"><label>RE/MAX report URL</label><input bind:value={trustBar.remaxReportUrl} /></div>
        <div class="adm-field"><label>Note</label><input bind:value={trustBar.note} /></div>
        {#each trustBar.press as pr, i}
          <div class="adm-repeat"><div class="adm-row"><div class="adm-field"><label>Press label</label><input bind:value={pr.label} /></div><div class="adm-field"><label>URL</label><input bind:value={pr.url} /></div></div><button type="button" class="adm-del" on:click={() => (trustBar.press = rmItem(trustBar.press, i))}>Remove</button></div>
        {/each}
        <button type="button" class="adm-btn ghost sm" on:click={() => (trustBar.press = [...trustBar.press, {}])}>+ Add press link</button>
      </section>

      <section class="adm-section">
        <h2>Testimonials</h2>
        {#each testimonials as t, i}
          <div class="adm-repeat"><div class="adm-field"><label>Quote</label><textarea rows="2" bind:value={t.quote}></textarea></div><div class="adm-row"><div class="adm-field"><label>Name</label><input bind:value={t.name} /></div><div class="adm-field"><label>Role</label><input bind:value={t.role} /></div></div><button type="button" class="adm-del" on:click={() => (testimonials = rmItem(testimonials, i))}>Remove</button></div>
        {/each}
        <button type="button" class="adm-btn ghost sm" on:click={() => (testimonials = [...testimonials, {}])}>+ Add testimonial</button>
      </section>

      <section class="adm-section">
        <h2>Availability (scarcity)</h2>
        <div class="adm-row"><div class="adm-field"><label>Reserved</label><input bind:value={availability.reserved} placeholder="1" /></div><div class="adm-field"><label>Total</label><input bind:value={availability.total} placeholder="2" /></div></div>
        <div class="adm-field"><label>Note</label><input bind:value={availability.note} placeholder="e.g. Villa A reserved" /></div>
        <p style="font-size:.8rem;color:#8a8577">Leave "Total" blank to hide the reservation indicator entirely.</p>
      </section>

      <section class="adm-section">
        <h2>Contact — extra</h2>
        <div class="adm-row"><div class="adm-field"><label>Tanzania phone (call only)</label><input bind:value={contact.phoneTz} /></div><div class="adm-field"><label>WhatsApp note</label><input bind:value={contact.whatsappNote} /></div></div>
        <div class="adm-field"><label>Calendly URL (Book a call)</label><input bind:value={contact.calendly} /></div>
      </section>

      <section class="adm-section">
        <h2>FAQ</h2>
        {#each faq as f, i}
          <div class="adm-repeat">
            <div class="adm-field"><label>Question</label><input bind:value={f.q} /></div>
            <div class="adm-field"><label>Answer</label><textarea rows="3" bind:value={f.a}></textarea></div>
            <button type="button" class="adm-del" on:click={() => removeFaq(i)}>Remove</button>
          </div>
        {/each}
        <button type="button" class="adm-btn ghost sm" on:click={addFaq}>+ Add question</button>
      </section>

      <div class="adm-savebar">
        <button type="submit" class="adm-btn" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        {#if saved}<span class="adm-ok">Saved ✓ — changes are live on the site.</span>{/if}
      </div>
    </form>
  </main>
</div>
