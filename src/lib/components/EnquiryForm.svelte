<script>
  import { brochureIntent } from '$lib/stores/enquiry';
  export let source = 'home';
  export let preselectHelp = []; // extra help options to pre-check (e.g. compare villas)

  const HELP_OPTIONS = [
    'Send me the brochure and price list',
    'Show me the projected rental returns',
    'Explain the payment plan',
    'Explain foreign ownership and legal structure',
    'Help me compare Villa A and Villa B',
    "I'm interested in purchasing both villas",
    'Arrange a call or site visit'
  ];
  const TIMEFRAMES = ['Immediately', 'Within 1–3 months', 'Within 3–6 months', 'Within 6–12 months', 'Just researching'];
  const DIAL_CODES = [
    { c: 'Tanzania', d: '+255' }, { c: 'Kenya', d: '+254' }, { c: 'Uganda', d: '+256' },
    { c: 'United Kingdom', d: '+44' }, { c: 'United States / Canada', d: '+1' }, { c: 'UAE', d: '+971' },
    { c: 'South Africa', d: '+27' }, { c: 'Germany', d: '+49' }, { c: 'Italy', d: '+39' },
    { c: 'France', d: '+33' }, { c: 'Netherlands', d: '+31' }, { c: 'Switzerland', d: '+41' }, { c: 'Other', d: '+' }
  ];

  let form;
  let status = 'idle';
  let selectedHelp = new Set(preselectHelp);
  let dialCode = '+255';
  let phoneNumber = '';
  let timeframe = '';
  let brochurePrimed = false;

  // Pre-check brochure option once when arriving via a Download-brochure CTA.
  // Edge-triggered (guarded by brochurePrimed) so the user can uncheck it
  // afterwards without it being silently re-added.
  $: if ($brochureIntent && !brochurePrimed) {
    selectedHelp = new Set([...selectedHelp, 'Send me the brochure and price list']);
    brochurePrimed = true;
  }

  function toggleHelp(opt) {
    const next = new Set(selectedHelp);
    next.has(opt) ? next.delete(opt) : next.add(opt);
    selectedHelp = next;
  }

  async function submit(e) {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    status = 'sending';
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.source = source;
    data.help = [...selectedHelp];
    data.timeframe = timeframe;
    data.phone = phoneNumber.trim() ? `${dialCode} ${phoneNumber.trim()}` : '';
    delete data.phoneNumber; delete data.dialCode;
    try {
      const res = await fetch('/api/enquire', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('failed');
      status = 'sent';
      form.reset(); selectedHelp = new Set(); phoneNumber = ''; timeframe = ''; dialCode = '+255';
      brochureIntent.set(false); brochurePrimed = false;
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
  <div class="field full">
    <label for="ph">Phone</label>
    <div class="phone-row">
      <select bind:value={dialCode} aria-label="Country dial code">
        {#each DIAL_CODES as x}<option value={x.d}>{x.c} ({x.d})</option>{/each}
      </select>
      <input id="ph" inputmode="tel" bind:value={phoneNumber} placeholder="712 345 678" />
    </div>
  </div>
  <fieldset class="field full help-set">
    <legend>How can we help?</legend>
    {#each HELP_OPTIONS as opt}
      <label class="chk"><input type="checkbox" checked={selectedHelp.has(opt)} on:change={() => toggleHelp(opt)} /> <span>{opt}</span></label>
    {/each}
  </fieldset>
  <div class="field full">
    <label for="tf">When are you considering purchasing?</label>
    <select id="tf" bind:value={timeframe}>
      <option value="" disabled selected>Select…</option>
      {#each TIMEFRAMES as t}<option value={t}>{t}</option>{/each}
    </select>
  </div>
  <div class="field full"><label for="ms">Message (optional)</label><textarea id="ms" name="message" rows="3" placeholder="Anything else we should know?"></textarea></div>
  <button type="submit" class="btn btn-primary btn-lg full" style="justify-content:center"
    style:background={status === 'sent' ? 'var(--gold)' : ''}
    disabled={status === 'sending' || status === 'sent'}>
    {#if status === 'sent'}Thank you — we'll be in touch ✓
    {:else if status === 'sending'}Sending…
    {:else if status === 'error'}Something went wrong — try again
    {:else}Send enquiry <span class="arrow">→</span>{/if}
  </button>
  <p class="form-note">By enquiring you agree to be contacted about Guri Escapes Pongwe. See our <a href="/privacy">Privacy Policy</a>. We never share your details.</p>
</form>

<style>
  .phone-row { display: grid; grid-template-columns: minmax(0, 44%) 1fr; gap: 0.5rem; }
  .phone-row select { min-width: 0; }
  .help-set { border: 0; padding: 0; margin: 0; }
  .help-set legend { padding: 0; font: inherit; margin-bottom: 0.5rem; }
  .chk { display: flex; align-items: flex-start; gap: 0.55rem; padding: 0.35rem 0; cursor: pointer; font-size: 0.95rem; }
  .chk input { margin-top: 0.2rem; flex: none; }
</style>
