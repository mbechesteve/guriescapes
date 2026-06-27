<script>
  import { enhance } from '$app/forms';
  import AdminBar from '$lib/components/AdminBar.svelte';
  export let data;

  let hero = { ...data.hero };
  let contact = { ...data.contact };
  let metrics = (data.metrics || []).map((m) => ({ ...m }));
  let faq = (data.faq || []).map((f) => ({ ...f }));

  let saving = false;
  let saved = false;
  let payload = '';

  const addFaq = () => (faq = [...faq, { q: '', a: '' }]);
  const removeFaq = (i) => (faq = faq.filter((_, x) => x !== i));

  function onSubmit() {
    payload = JSON.stringify({ hero, contact, metrics, faq });
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
