<script>
  import { enhance } from '$app/forms';
  export let form;
  let loading = false;
</script>

<svelte:head><title>Admin · Guri Escapes</title></svelte:head>

<div class="login">
  <div class="login-card">
    <img src="/assets/img/logo-dark.png" alt="Guri Escapes" class="login-logo" />
    <h1>Admin sign in</h1>
    <p class="sub">Enter the admin password to view enquiries.</p>

    <form
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          await update();
          loading = false;
        };
      }}
    >
      <label for="un">Username</label>
      <input id="un" name="username" type="text" autocomplete="username" value={form?.username ?? ''} required autofocus />
      <label for="pw" class="mt">Password</label>
      <input id="pw" name="password" type="password" autocomplete="current-password" required />
      {#if form?.error}<p class="err">{form.error}</p>{/if}
      <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
    </form>

    <a class="back" href="/">← Back to site</a>
  </div>
</div>

<style>
  .login {
    min-height: 100dvh;
    display: grid;
    place-items: center;
    background: var(--sage-deep);
    padding: 24px;
  }
  .login-card {
    width: 100%;
    max-width: 400px;
    background: var(--cream);
    border-radius: 16px;
    padding: clamp(28px, 5vw, 44px);
    box-shadow: 0 30px 70px -30px rgba(0, 0, 0, 0.5);
    text-align: center;
  }
  .login-logo { height: 70px; width: auto; margin: 0 auto 1.4rem; display: block; }
  h1 { font-family: var(--f-display); font-weight: 400; font-size: 1.9rem; color: var(--ink); margin: 0; }
  .sub { color: var(--ink-soft); font-size: 0.95rem; margin: 0.5rem 0 1.8rem; }
  form { text-align: left; }
  label { display: block; font-size: 0.74rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft); }
  label.mt { margin-top: 1.1rem; }
  input {
    width: 100%;
    margin: 0.5rem 0 0;
    padding: 0.85em 1em;
    border: 1px solid var(--line);
    border-radius: 10px;
    font-family: var(--f-body);
    font-size: 1rem;
    background: #fff;
  }
  input:focus { outline: none; border-color: var(--wood); }
  .err { color: #a3432b; font-size: 0.88rem; margin: 0.8rem 0 0; }
  button {
    width: 100%;
    margin-top: 1.4rem;
    background: var(--wood);
    color: #fff;
    border: 0;
    border-radius: 50px;
    padding: 1em;
    font-family: var(--f-body);
    font-weight: 500;
    font-size: 0.95rem;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: background 0.3s;
  }
  button:hover:not(:disabled) { background: #a97c47; }
  button:disabled { opacity: 0.7; cursor: default; }
  .back { display: inline-block; margin-top: 1.6rem; color: var(--ink-soft); font-size: 0.85rem; text-decoration: none; }
  .back:hover { color: var(--wood); }
</style>
