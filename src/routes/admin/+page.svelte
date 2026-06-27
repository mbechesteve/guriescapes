<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  export let data;

  // Filter state seeded from the server (persists across same-page navigations).
  let q = data.filters.q;
  let statusFilter = data.filters.status;
  let sourceFilter = data.filters.source;
  let searchTimer;

  let savingId = null;
  let savedId = null;

  const statusColors = {
    New: { bg: 'var(--sand)', fg: 'var(--ink)' },
    Contacted: { bg: 'var(--wood)', fg: '#fff' },
    Viewing: { bg: '#6f7d4a', fg: '#fff' },
    Negotiating: { bg: 'var(--gold)', fg: '#2b2e18' },
    Won: { bg: '#3f6b3a', fg: '#fff' },
    Lost: { bg: '#8a8577', fg: '#fff' }
  };

  $: sourceOptions = ['all', ...data.sources];
  $: maxViews = Math.max(1, ...data.analytics.views.map((v) => v.count));

  function buildUrl(page = 1) {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (statusFilter && statusFilter !== 'all') p.set('status', statusFilter);
    if (sourceFilter && sourceFilter !== 'all') p.set('source', sourceFilter);
    if (page > 1) p.set('page', String(page));
    const qs = p.toString();
    return '/admin' + (qs ? `?${qs}` : '');
  }
  const applyFilters = () => goto(buildUrl(1), { keepFocus: true, noScroll: true });
  function onSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 350);
  }
  const gotoPage = (n) => goto(buildUrl(n), { noScroll: true });

  function fmt(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
  const sourceLabel = (s) => (s ? s.replace('-', ' ') : 'site');
</script>

<svelte:head><title>Dashboard · Guri Escapes Admin</title></svelte:head>

<div class="admin">
  <header class="admin-bar">
    <a href="/admin" class="brand"><img src="/assets/img/logo-cream.png" alt="Guri Escapes" /> <span>Admin</span></a>
    <nav>
      <a href="/" class="ghost">View site ↗</a>
      <form method="POST" action="/admin/logout"><button type="submit">Log out</button></form>
    </nav>
  </header>

  <main class="wrap-admin">
    <img class="dash-frond" src="/assets/img/frond.svg" alt="" aria-hidden="true" />
    <h1>Dashboard</h1>

    {#if data.dbError}
      <div class="notice err">{data.dbError}</div>
    {:else}
      <!-- OVERVIEW -->
      <section class="overview">
        <div class="stat-row">
          <div class="stat"><span class="n">{data.totalLeads}</span><span class="l">Total leads</span></div>
          <div class="stat accent-wood"><span class="n">{data.statusCounts.New}</span><span class="l">New</span></div>
          <div class="stat"><span class="n">{data.statusCounts.Contacted}</span><span class="l">Contacted</span></div>
          <div class="stat accent-won"><span class="n">{data.statusCounts.Won}</span><span class="l">Won</span></div>
          <div class="stat"><span class="n">{data.analytics.totalViews}</span><span class="l">Page views</span></div>
          <div class="stat"><span class="n">{data.analytics.viewsLast7}</span><span class="l">Views · 7 days</span></div>
        </div>

        <div class="panels">
          <div class="panel">
            <h3>Pipeline</h3>
            {#each data.statuses as s}
              <div class="bar-row" class:zero={data.statusCounts[s] === 0}>
                <span class="bar-label"><i class="dot" style:background={statusColors[s].bg}></i>{s}</span>
                <span class="bar-track">
                  <span class="bar-fill" style:width={`${(data.statusCounts[s] / Math.max(1, data.enquiries.length)) * 100}%`} style:background={statusColors[s].bg}></span>
                </span>
                <span class="bar-n">{data.statusCounts[s]}</span>
              </div>
            {/each}
          </div>

          <div class="panel">
            <h3>Most-visited pages</h3>
            {#if data.analytics.views.length === 0}
              <p class="muted">No page views recorded yet.</p>
            {:else}
              {#each data.analytics.views as v}
                <div class="bar-row">
                  <span class="bar-label">{v.label}</span>
                  <span class="bar-track"><span class="bar-fill wood" style:width={`${(v.count / maxViews) * 100}%`}></span></span>
                  <span class="bar-n">{v.count}<small>{v.last7 ? ` · ${v.last7}/7d` : ''}</small></span>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </section>

      <!-- LEADS -->
      <div class="head">
        <h2>Leads <span class="count">{data.total}</span></h2>
        <div class="filters">
          <input type="search" placeholder="Search name, email, notes…" bind:value={q} on:input={onSearch} />
          <select bind:value={statusFilter} on:change={applyFilters}>
            <option value="all">All statuses</option>
            {#each data.statuses as s}<option value={s}>{s}</option>{/each}
          </select>
          <select bind:value={sourceFilter} on:change={applyFilters}>
            {#each sourceOptions as s}<option value={s}>{s === 'all' ? 'All sources' : sourceLabel(s)}</option>{/each}
          </select>
        </div>
      </div>

      {#if data.totalLeads === 0}
        <div class="notice">No enquiries yet. Submissions from the site forms will appear here.</div>
      {:else if data.total === 0}
        <div class="notice">No leads match your filters. <button class="link" on:click={() => { q=''; statusFilter='all'; sourceFilter='all'; applyFilters(); }}>Clear filters</button></div>
      {:else}
        <div class="list">
          {#each data.enquiries as e (e.id)}
            <article class="card">
              <div class="card-top">
                <div>
                  <h3 class="name">
                    {e.firstname} {e.lastname}
                    <span class="badge" style:background={statusColors[e.status].bg} style:color={statusColors[e.status].fg}>{e.status}</span>
                  </h3>
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
                {#if e.nextStep}<span class="tag next">Next: {e.nextStep}{e.nextStepDate ? ` (${e.nextStepDate})` : ''}</span>{/if}
              </div>

              {#if e.message}<p class="msg">{e.message}</p>{/if}

              <form
                class="manage"
                method="POST"
                action="?/update"
                use:enhance={() => {
                  savingId = e.id;
                  return async ({ result, update }) => {
                    await update({ reset: false });
                    savingId = null;
                    if (result.type === 'success') { savedId = e.id; setTimeout(() => (savedId = null), 2000); }
                  };
                }}
              >
                <input type="hidden" name="id" value={e.id} />
                <div class="m-grid">
                  <label>Status
                    <select name="status" value={e.status}>
                      {#each data.statuses as s}<option value={s}>{s}</option>{/each}
                    </select>
                  </label>
                  <label>Next step
                    <input name="nextStep" value={e.nextStep} placeholder="e.g. Send brochure, call back" />
                  </label>
                  <label>Follow-up date
                    <input type="date" name="nextStepDate" value={e.nextStepDate} />
                  </label>
                </div>
                <label class="full">Notes
                  <textarea name="notes" rows="2" placeholder="Internal notes about this lead…">{e.notes}</textarea>
                </label>
                <div class="m-actions">
                  <button type="submit" disabled={savingId === e.id}>
                    {savingId === e.id ? 'Saving…' : savedId === e.id ? 'Saved ✓' : 'Save'}
                  </button>
                  {#if e.updatedAt}<span class="upd">Updated {fmt(e.updatedAt)}</span>{/if}
                </div>
              </form>
            </article>
          {/each}
        </div>

        {#if data.totalPages > 1}
          <div class="pager">
            <button on:click={() => gotoPage(data.page - 1)} disabled={data.page <= 1}>← Prev</button>
            <span class="pager-info">Page {data.page} of {data.totalPages} · {data.total} leads</span>
            <button on:click={() => gotoPage(data.page + 1)} disabled={data.page >= data.totalPages}>Next →</button>
          </div>
        {/if}
      {/if}
    {/if}
  </main>
</div>

<style>
  .admin { min-height: 100dvh; background: var(--cream); }
  .admin-bar {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    background: var(--sage-deep); color: var(--cream); padding: 12px clamp(16px, 4vw, 40px);
  }
  .brand { display: flex; align-items: center; gap: 0.7rem; color: var(--cream); text-decoration: none; }
  .brand img { height: 38px; }
  .brand span { font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); }
  .admin-bar nav { display: flex; align-items: center; gap: 0.8rem; }
  .admin-bar .ghost { color: rgba(252, 248, 239, 0.85); text-decoration: none; font-size: 0.85rem; }
  .admin-bar .ghost:hover { color: var(--cream); }
  .admin-bar button { background: var(--wood); color: #fff; border: 0; border-radius: 50px; padding: 0.55em 1.2em; font-family: var(--f-body); font-size: 0.82rem; cursor: pointer; }
  .admin-bar button:hover { background: #a97c47; }

  .wrap-admin { position: relative; max-width: 1040px; margin: 0 auto; padding: clamp(24px, 4vw, 44px) clamp(16px, 4vw, 40px) 90px; }
  .dash-frond { position: absolute; top: 6px; right: clamp(10px, 4vw, 30px); width: clamp(120px, 16vw, 200px); opacity: 0.07; transform: rotate(-8deg); pointer-events: none; }
  h1 { font-family: var(--f-display); font-weight: 400; font-size: clamp(2.2rem, 4vw, 3rem); color: var(--ink); margin: 0 0 1.6rem; position: relative; }

  /* Overview */
  .stat-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; position: relative; }
  .stat { background: #fff; padding: 1.2rem 1rem; text-align: center; transition: background 0.2s ease; }
  .stat:hover { background: #fffdf7; }
  .stat .n {
    display: block;
    font-family: var(--f-body);
    font-weight: 600;
    font-size: clamp(1.7rem, 3vw, 2.3rem);
    font-variant-numeric: tabular-nums lining-nums;
    letter-spacing: -0.01em;
    color: var(--ink);
    line-height: 1;
  }
  .stat.accent-wood .n { color: var(--wood); }
  .stat.accent-won .n { color: #3f6b3a; }
  .stat .l { display: block; margin-top: 0.45rem; font-size: 0.66rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-soft); }

  .panels { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
  .panel { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 1.3rem 1.4rem; }
  .panel h3 { font-family: var(--f-body); font-weight: 600; font-size: 0.74rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 1rem; }
  .bar-row { display: grid; grid-template-columns: 130px 1fr auto; align-items: center; gap: 0.8rem; margin-bottom: 0.55rem; font-size: 0.9rem; transition: opacity 0.2s ease; }
  .bar-row.zero { opacity: 0.4; }
  .bar-label { color: var(--ink); display: flex; align-items: center; gap: 0.5rem; }
  .dot { width: 9px; height: 9px; border-radius: 50%; flex: none; }
  .bar-track { height: 6px; background: var(--sand); border-radius: 6px; overflow: hidden; }
  .bar-fill { display: block; height: 100%; border-radius: 6px; background: var(--sage); transition: width 0.4s ease; min-width: 0; }
  .bar-fill.wood { background: var(--wood); }
  .bar-n { color: var(--ink); font-weight: 500; font-variant-numeric: tabular-nums lining-nums; min-width: 2ch; text-align: right; }
  .bar-n small { color: var(--ink-soft); opacity: 0.7; }
  .muted { color: var(--ink-soft); font-size: 0.9rem; margin: 0; }

  /* Leads */
  .head { display: flex; flex-wrap: wrap; gap: 1rem; align-items: baseline; justify-content: space-between; margin: 2.4rem 0 1.2rem; }
  h2 { font-family: var(--f-display); font-weight: 400; font-size: 1.8rem; color: var(--ink); margin: 0; }
  h2 .count { font-family: var(--f-body); font-size: 0.85rem; color: var(--ink-soft); margin-left: 0.5rem; }
  .filters { display: flex; gap: 0.6rem; flex-wrap: wrap; }
  .filters input, .filters select { padding: 0.6em 0.9em; border: 1px solid var(--line); border-radius: 10px; font-family: var(--f-body); font-size: 0.9rem; background: #fff; color: var(--ink); }
  .filters input { min-width: 180px; }
  .filters input:focus, .filters select:focus { outline: none; border-color: var(--wood); }

  .notice { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 2rem; color: var(--ink-soft); text-align: center; }
  .notice .link { background: none; border: 0; color: var(--wood); cursor: pointer; font: inherit; text-decoration: underline; padding: 0; }

  .pager { display: flex; align-items: center; justify-content: center; gap: 1.2rem; margin-top: 1.8rem; }
  .pager button { background: #fff; border: 1px solid var(--line); border-radius: 50px; padding: 0.6em 1.3em; font-family: var(--f-body); font-size: 0.88rem; color: var(--ink); cursor: pointer; transition: 0.2s ease; }
  .pager button:hover:not(:disabled) { border-color: var(--wood); color: var(--wood); }
  .pager button:disabled { opacity: 0.4; cursor: default; }
  .pager-info { font-size: 0.85rem; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
  .notice.err { border-color: #d8b4a6; color: #a3432b; background: #fbf1ec; }

  .list { display: grid; gap: 1rem; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: clamp(16px, 2.4vw, 24px); }
  .card-top { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
  .name { font-family: var(--f-display); font-weight: 500; font-size: 1.35rem; margin: 0; color: var(--ink); display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
  .badge { font-family: var(--f-body); font-size: 0.66rem; letter-spacing: 0.06em; text-transform: uppercase; padding: 0.32em 0.7em; border-radius: 50px; }
  .meta { font-size: 0.9rem; color: var(--ink-soft); margin-top: 0.2rem; }
  .meta a { color: var(--wood); text-decoration: none; }
  .meta a:hover { text-decoration: underline; }
  time { font-size: 0.8rem; color: var(--ink-soft); white-space: nowrap; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.9rem; }
  .tag { font-size: 0.72rem; padding: 0.35em 0.8em; border-radius: 50px; }
  .tag.interest { background: var(--sand); color: var(--ink); }
  .tag.source { background: var(--sage); color: var(--cream); text-transform: capitalize; }
  .tag.next { background: #eef0e3; color: var(--sage-deep); }
  .msg { margin: 1rem 0 0; color: var(--ink); line-height: 1.6; font-size: 0.96rem; white-space: pre-wrap; }

  .manage { margin-top: 1.2rem; padding-top: 1.2rem; border-top: 1px dashed var(--line); }
  .m-grid { display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 0.8rem; }
  .manage label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-soft); }
  .manage label.full { margin-top: 0.8rem; }
  .manage select, .manage input, .manage textarea {
    font-family: var(--f-body); font-size: 0.92rem; text-transform: none; letter-spacing: normal;
    color: var(--ink); background: var(--cream); border: 1px solid var(--line); border-radius: 8px; padding: 0.6em 0.7em;
  }
  .manage select:focus, .manage input:focus, .manage textarea:focus { outline: none; border-color: var(--wood); }
  .manage textarea { resize: vertical; }
  .m-actions { display: flex; align-items: center; gap: 1rem; margin-top: 0.9rem; }
  .m-actions button { background: var(--sage); color: var(--cream); border: 0; border-radius: 50px; padding: 0.6em 1.6em; font-family: var(--f-body); font-size: 0.85rem; cursor: pointer; transition: background 0.3s; }
  .m-actions button:hover:not(:disabled) { background: var(--sage-deep); }
  .m-actions button:disabled { opacity: 0.7; cursor: default; }
  .upd { font-size: 0.78rem; color: var(--ink-soft); }

  @media (max-width: 760px) {
    .stat-row { grid-template-columns: repeat(3, 1fr); }
    .panels { grid-template-columns: 1fr; }
    .m-grid { grid-template-columns: 1fr; }
    .bar-row { grid-template-columns: 110px 1fr auto; }
  }
  @media (max-width: 480px) {
    .stat-row { grid-template-columns: repeat(2, 1fr); }
    .filters input { min-width: 0; flex: 1; }
  }
</style>
