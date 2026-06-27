<script>
  export let source = 'home';
  export let defaultInterest = 'Villa A — Pongwe';

  const interests = [
    'Villa A — Pongwe',
    'Villa B — Pongwe',
    'Both villas (managed pair)',
    'The full brochure & pricing'
  ];

  let form;
  let status = 'idle'; // idle | sending | sent | error

  async function submit(e) {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    status = 'sending';
    const data = Object.fromEntries(new FormData(form).entries());
    data.source = source;
    try {
      const res = await fetch('/api/enquire', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('failed');
      status = 'sent';
      form.reset();
      setTimeout(() => (status = 'idle'), 3500);
    } catch {
      status = 'error';
      setTimeout(() => (status = 'idle'), 4000);
    }
  }
</script>

<form bind:this={form} on:submit={submit}>
  <div class="field"><label for="fn">First name</label><input id="fn" name="firstname" required placeholder="Jane" /></div>
  <div class="field"><label for="ln">Last name</label><input id="ln" name="lastname" required placeholder="Doe" /></div>
  <div class="field"><label for="em">Email</label><input id="em" type="email" name="email" required placeholder="you@email.com" /></div>
  <div class="field"><label for="ph">Phone</label><input id="ph" name="phone" placeholder="+254 ..." /></div>
  <div class="field full">
    <label for="iv">I'm interested in</label>
    <select id="iv" name="interest">
      {#each interests as opt}
        <option selected={opt === defaultInterest}>{opt}</option>
      {/each}
    </select>
  </div>
  <div class="field full"><label for="ms">Message</label><textarea id="ms" name="message" rows="4" placeholder="When are you looking to buy? Any questions?"></textarea></div>
  <button
    type="submit"
    class="btn btn-primary btn-lg full"
    style="justify-content:center"
    style:background={status === 'sent' ? 'var(--gold)' : ''}
    disabled={status === 'sending' || status === 'sent'}
  >
    {#if status === 'sent'}Thank you — we’ll be in touch ✓
    {:else if status === 'sending'}Sending…
    {:else if status === 'error'}Something went wrong — try again
    {:else}Send enquiry <span class="arrow">→</span>{/if}
  </button>
  <p class="form-note">By enquiring you agree to be contacted about Guri Escapes Pongwe. We never share your details.</p>
</form>
