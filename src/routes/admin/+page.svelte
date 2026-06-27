<script>
  export let data;

  let q = '';
  let sourceFilter = 'all';

  $: sources = ['all', ...Array.from(new Set(data.enquiries.map((e) => e.source).filter(Boolean)))];

  $: filtered = data.enquiries.filter((e) => {
    const matchesSource = sourceFilter === 'all' || e.source === sourceFilter;
    const hay = `${e.firstname} ${e.lastname} ${e.email} ${e.phone} ${e.interest} ${e.message}`.toLowerCase();
    const matchesQ = !q.trim() || hay.includes(q.trim().toLowerCase());
    return matchesSource && matchesQ;
  });

  function fmt(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
  const sourceLabel = (s) => (s ? s.replace('-', ' ') : 'site');
</script>

<svelte:head><title>Enquiries · Guri Escapes Admin</title></svelte:head>

<div class="admin">
  <header class="admin-bar">
    <a href="/admin" class="brand"><img src="/assets/img/logo-cream.png" alt="Guri Escapes" /> <span>Admin</span></a>
    <nav>
      <a href="/" class="ghost">View site ↗</a>
      <form method="POST" action="/admin/logout"><button type="submit">Log out</button></form>
    </nav>
  </header>

  <main class="wrap-admin">
    <div class="head">
      <div>
        <h1>Enquiries</h1>
        <p class="count">{data.enquiries.length} total{filtered.length !== data.enquiries.length ? ` · ${filtered.length} shown` : ''}</p>
      </div>
      <div class="filters">
        <input type="search" placeholder="Search name, email, message…" bind:value={q} />
        <select bind:value={sourceFilter}>
          {#each sources as s}<option value={s}>{s === 'all' ? 'All sources' : sourceLabel(s)}</option>{/each}
        </select>
      </div>
    </div>

    {#if data.dbError}
      <div class="notice err">{data.dbError}</div>
    {:else if data.enquiries.length === 0}
      <div class="notice">No enquiries yet. Submissions from the site forms will appear here.</div>
    {:else if filtered.length === 0}
      <div class="notice">No enquiries match your search.</div>
    {:else}
      <div class="list">
        {#each filtered as e (e.id)}
          <article class="card">
            <div class="card-top">
              <div>
                <h2>{e.firstname} {e.lastname}</h2>
                <div class="meta">
                  <a href={`mailto:${e.email}`}>{e.email}</a>
                  {#if e.phone}<span>· {e.phone}</span>{/if}
                </div>
              </div>
              <time>{fmt(e.createdAt)}</time>
            </div>
            <div class="tags">
              {#if e.interest}<span class="tag interest">{e.interest}</span>{/if}
              <span class="tag source">{sourceLabel(e.source)}</span>
            </div>
            {#if e.message}<p class="msg">{e.message}</p>{/if}
          </article>
        {/each}
      </div>
    {/if}
  </main>
</div>

<style>
  .admin { min-height: 100dvh; background: var(--cream); }
  .admin-bar {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    background: var(--sage-deep); color: var(--cream);
    padding: 12px clamp(16px, 4vw, 40px);
  }
  .brand { display: flex; align-items: center; gap: 0.7rem; color: var(--cream); text-decoration: none; }
  .brand img { height: 38px; }
  .brand span { font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); }
  .admin-bar nav { display: flex; align-items: center; gap: 0.8rem; }
  .admin-bar .ghost { color: rgba(252, 248, 239, 0.85); text-decoration: none; font-size: 0.85rem; }
  .admin-bar .ghost:hover { color: var(--cream); }
  .admin-bar button {
    background: var(--wood); color: #fff; border: 0; border-radius: 50px;
    padding: 0.55em 1.2em; font-family: var(--f-body); font-size: 0.82rem; cursor: pointer;
  }
  .admin-bar button:hover { background: #a97c47; }

  .wrap-admin { max-width: 1000px; margin: 0 auto; padding: clamp(24px, 5vw, 48px) clamp(16px, 4vw, 40px) 80px; }
  .head { display: flex; flex-wrap: wrap; gap: 1.2rem; align-items: flex-end; justify-content: space-between; margin-bottom: 1.8rem; }
  h1 { font-family: var(--f-display); font-weight: 400; font-size: clamp(2rem, 4vw, 2.8rem); color: var(--ink); margin: 0; }
  .count { color: var(--ink-soft); margin: 0.3rem 0 0; font-size: 0.92rem; }
  .filters { display: flex; gap: 0.6rem; flex-wrap: wrap; }
  .filters input, .filters select {
    padding: 0.7em 1em; border: 1px solid var(--line); border-radius: 10px;
    font-family: var(--f-body); font-size: 0.92rem; background: #fff; color: var(--ink);
  }
  .filters input { min-width: 230px; }
  .filters input:focus, .filters select:focus { outline: none; border-color: var(--wood); }

  .notice { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 2rem; color: var(--ink-soft); text-align: center; }
  .notice.err { border-color: #d8b4a6; color: #a3432b; background: #fbf1ec; }

  .list { display: grid; gap: 1rem; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: clamp(16px, 2.4vw, 24px); }
  .card-top { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
  .card h2 { font-family: var(--f-display); font-weight: 500; font-size: 1.35rem; margin: 0; color: var(--ink); }
  .meta { font-size: 0.9rem; color: var(--ink-soft); margin-top: 0.2rem; }
  .meta a { color: var(--wood); text-decoration: none; }
  .meta a:hover { text-decoration: underline; }
  time { font-size: 0.8rem; color: var(--ink-soft); white-space: nowrap; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.9rem; }
  .tag { font-size: 0.72rem; letter-spacing: 0.04em; padding: 0.35em 0.8em; border-radius: 50px; }
  .tag.interest { background: var(--sand); color: var(--ink); }
  .tag.source { background: var(--sage); color: var(--cream); text-transform: capitalize; }
  .msg { margin: 1rem 0 0; color: var(--ink); line-height: 1.6; font-size: 0.96rem; white-space: pre-wrap; }

  @media (max-width: 560px) {
    .filters input { min-width: 0; flex: 1; }
    .card-top { flex-direction: column; }
  }
</style>
