<script>
  import { enhance } from '$app/forms';
  import AdminBar from '$lib/components/AdminBar.svelte';
  export let data;
</script>

<svelte:head><title>Villas · Guri Escapes Admin</title></svelte:head>

<div class="adm-page">
  <AdminBar />
  <main class="adm-wrap">
    <div class="vh">
      <h1 class="adm-h1" style="margin:0">Villas</h1>
      <form method="POST" action="?/create" use:enhance>
        <button type="submit" class="adm-btn">+ Add villa</button>
      </form>
    </div>

    {#if data.villas.length === 0}
      <div class="adm-section">No villas yet. Add one to get started.</div>
    {:else}
      <div class="vlist">
        {#each data.villas as v (v.id)}
          <div class="vrow">
            <a class="vthumb" href={`/admin/villas/${v.id}`}>
              {#if v.cardImage}<img src={v.cardImage} alt={v.name} />{:else}<span class="ph">No image</span>{/if}
            </a>
            <div class="vinfo">
              <a class="vname" href={`/admin/villas/${v.id}`}>{v.name}</a>
              <div class="vmeta">/{v.slug} · {v.priceFrom ? `From USD ${v.priceFrom}` : 'No price'}</div>
            </div>
            <form method="POST" action="?/togglePublish" use:enhance class="vpub">
              <input type="hidden" name="id" value={v.id} />
              <input type="hidden" name="published" value={(!v.published).toString()} />
              <button type="submit" class="pill {v.published ? 'on' : 'off'}">{v.published ? 'Published' : 'Draft'}</button>
            </form>
            <a class="adm-btn ghost sm" href={`/admin/villas/${v.id}`}>Edit</a>
            <form method="POST" action="?/delete" use:enhance={() => ({ result, update }) => { update(); }}>
              <input type="hidden" name="id" value={v.id} />
              <button type="submit" class="adm-del" on:click={(e) => { if (!confirm(`Delete ${v.name}?`)) e.preventDefault(); }}>Delete</button>
            </form>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

<style>
  .vh { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.6rem; gap: 1rem; }
  .vlist { display: grid; gap: 0.7rem; }
  .vrow { display: grid; grid-template-columns: 72px 1fr auto auto auto; align-items: center; gap: 1rem; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 0.7rem 1rem; }
  .vthumb { width: 72px; height: 54px; border-radius: 8px; overflow: hidden; background: var(--sand); display: grid; place-items: center; }
  .vthumb img { width: 100%; height: 100%; object-fit: cover; }
  .vthumb .ph { font-size: 0.65rem; color: var(--ink-soft); }
  .vname { font-family: var(--f-display); font-size: 1.2rem; color: var(--ink); text-decoration: none; }
  .vname:hover { color: var(--wood); }
  .vmeta { font-size: 0.82rem; color: var(--ink-soft); margin-top: 0.15rem; }
  .pill { border: 0; border-radius: 50px; padding: 0.4em 0.9em; font-family: var(--f-body); font-size: 0.74rem; cursor: pointer; }
  .pill.on { background: #3f6b3a; color: #fff; }
  .pill.off { background: var(--sand); color: var(--ink-soft); }
  @media (max-width: 640px) {
    .vrow { grid-template-columns: 56px 1fr auto; row-gap: 0.6rem; }
    .vthumb { width: 56px; height: 44px; }
    .vpub, .vrow > a.adm-btn { grid-column: 2 / -1; justify-self: start; }
  }
</style>
