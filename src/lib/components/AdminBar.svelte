<script>
  import { page } from '$app/stores';
  $: path = $page.url.pathname;
  const isActive = (p) => (p === '/admin' ? path === '/admin' : path.startsWith(p));
</script>

<header class="admin-bar">
  <a href="/admin" class="brand"><img src="/assets/img/logo-cream.png" alt="Guri Escapes" /> <span>Admin</span></a>
  <nav>
    <a href="/admin" class:active={isActive('/admin')}>Leads</a>
    <a href="/admin/villas" class:active={isActive('/admin/villas')}>Villas</a>
    <a href="/admin/content" class:active={isActive('/admin/content')}>Content</a>
    <a href="/" class="ghost">View site ↗</a>
    <form method="POST" action="/admin/logout"><button type="submit">Log out</button></form>
  </nav>
</header>

<style>
  .admin-bar {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    background: var(--sage-deep); color: var(--cream); padding: 12px clamp(16px, 4vw, 40px);
  }
  .brand { display: flex; align-items: center; gap: 0.7rem; color: var(--cream); text-decoration: none; flex: none; }
  .brand img { height: 38px; }
  .brand span { font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); }
  nav { display: flex; align-items: center; gap: clamp(0.5rem, 1.6vw, 1.1rem); flex-wrap: wrap; justify-content: flex-end; }
  nav a { color: rgba(252, 248, 239, 0.78); text-decoration: none; font-size: 0.86rem; padding: 0.3em 0; transition: color 0.2s; }
  nav a:hover { color: var(--cream); }
  nav a.active { color: var(--cream); border-bottom: 2px solid var(--wood); }
  nav a.ghost { color: rgba(252, 248, 239, 0.6); font-size: 0.82rem; }
  nav button { background: var(--wood); color: #fff; border: 0; border-radius: 50px; padding: 0.5em 1.1em; font-family: var(--f-body); font-size: 0.82rem; cursor: pointer; }
  nav button:hover { background: #a97c47; }
</style>
