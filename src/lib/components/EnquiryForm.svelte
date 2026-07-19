<script>
  import { brochureIntent } from '$lib/stores/enquiry';
  import { onMount, onDestroy } from 'svelte';
  import 'intl-tel-input/dist/css/intlTelInput.css';

  export let source = 'home';
  export let preselectHelp = []; // help options to pre-check (e.g. compare villas)

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

  let form;
  let status = 'idle';
  let selectedHelp = new Set(preselectHelp);
  let timeframe = '';
  let brochurePrimed = false;

  // "How can we help?" multi-select dropdown state
  let helpOpen = false;
  let msEl; // container ref for click-outside

  // Phone (intl-tel-input)
  let phoneEl; // the <input> the widget enhances
  let iti; // the intl-tel-input instance (client only)

  onMount(async () => {
    const { default: intlTelInput } = await import('intl-tel-input/intlTelInputWithUtils');
    iti = intlTelInput(phoneEl, {
      initialCountry: 'tz',
      separateDialCode: true,
      countrySearch: true
    });
  });
  onDestroy(() => iti?.destroy());

  // Pre-check the brochure option once when arriving via a Download-brochure CTA.
  // Edge-triggered (guarded by brochurePrimed) so the user can uncheck it after.
  $: if ($brochureIntent && !brochurePrimed) {
    selectedHelp = new Set([...selectedHelp, 'Send me the brochure and price list']);
    brochurePrimed = true;
  }

  $: helpSummary =
    selectedHelp.size === 0 ? 'Select one or more…'
    : selectedHelp.size === 1 ? [...selectedHelp][0]
    : `${selectedHelp.size} selected`;

  function toggleHelp(opt) {
    const next = new Set(selectedHelp);
    next.has(opt) ? next.delete(opt) : next.add(opt);
    selectedHelp = next;
  }

  function onWindowClick(e) {
    if (helpOpen && msEl && !msEl.contains(e.target)) helpOpen = false;
  }

  function phoneValue() {
    if (!iti) return '';
    const full = iti.getNumber(); // E.164 when parseable (utils bundled)
    if (full) return full;
    const raw = phoneEl?.value.trim();
    if (!raw) return '';
    const dc = iti.getSelectedCountry()?.dialCode;
    return dc ? `+${dc} ${raw}` : raw;
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
    data.phone = phoneValue();
    delete data.phone_national; // the raw widget input (has a name only for FormData hygiene)
    try {
      const res = await fetch('/api/enquire', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('failed');
      status = 'sent';
      form.reset();
      selectedHelp = new Set(); timeframe = ''; helpOpen = false;
      iti?.setNumber(''); iti?.setSelectedCountry('tz');
      brochureIntent.set(false); brochurePrimed = false;
      setTimeout(() => (status = 'idle'), 3500);
    } catch {
      status = 'error';
      setTimeout(() => (status = 'idle'), 4000);
    }
  }
</script>

<svelte:window on:click={onWindowClick} />

<form bind:this={form} on:submit={submit}>
  <div class="field"><label for="fn">First name</label><input id="fn" name="firstname" required placeholder="Jane" /></div>
  <div class="field"><label for="ln">Last name</label><input id="ln" name="lastname" required placeholder="Doe" /></div>
  <div class="field"><label for="em">Email</label><input id="em" type="email" name="email" required placeholder="you@email.com" /></div>
  <div class="field full">
    <label for="ph">Phone number</label>
    <input id="ph" name="phone_national" type="tel" bind:this={phoneEl} placeholder="Enter phone number" autocomplete="tel" />
  </div>
  <div class="field full">
    <label id="help-label" for="help-btn">How can we help?</label>
    <div class="ms" bind:this={msEl}>
      <button
        id="help-btn" type="button" class="ms-btn" class:placeholder={selectedHelp.size === 0}
        aria-haspopup="true" aria-expanded={helpOpen} aria-labelledby="help-label help-btn"
        on:click={() => (helpOpen = !helpOpen)}
      >
        <span class="ms-summary">{helpSummary}</span>
        <span class="ms-caret" class:open={helpOpen} aria-hidden="true">▾</span>
      </button>
      {#if helpOpen}
        <div class="ms-panel" role="group" aria-labelledby="help-label">
          {#each HELP_OPTIONS as opt}
            <label class="ms-opt">
              <input type="checkbox" checked={selectedHelp.has(opt)} on:change={() => toggleHelp(opt)} />
              <span>{opt}</span>
            </label>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  <div class="field full">
    <label for="tf">When are you considering purchasing?</label>
    <select id="tf" bind:value={timeframe}>
      <option value="" disabled selected>Select…</option>
      {#each TIMEFRAMES as t}<option value={t}>{t}</option>{/each}
    </select>
  </div>
  <div class="field full"><label for="msg">Message (optional)</label><textarea id="msg" name="message" rows="3" placeholder="Anything else we should know?"></textarea></div>
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
  /* intl-tel-input: make it fill the field and match the site inputs */
  :global(.iti) { width: 100%; display: block; }
  :global(.iti__tel-input),
  .field :global(.iti input[type='tel']) { width: 100%; }

  /* Multi-select "How can we help?" dropdown */
  .ms { position: relative; }
  .ms-btn {
    width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
    font: inherit; text-align: left; cursor: pointer;
    color: var(--ink); background: var(--cream, #fff);
    border: 1px solid var(--line, #d9d3c4); border-radius: 10px; padding: 0.75em 0.9em;
  }
  .ms-btn.placeholder .ms-summary { color: var(--ink-soft, #8a8577); }
  .ms-btn:focus-visible { outline: 2px solid var(--wood); outline-offset: 1px; }
  .ms-summary { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ms-caret { flex: none; transition: transform 0.2s ease; }
  .ms-caret.open { transform: rotate(180deg); }
  .ms-panel {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 30;
    background: #fff; border: 1px solid var(--line, #d9d3c4); border-radius: 10px;
    box-shadow: 0 14px 40px -18px rgba(0, 0, 0, 0.45); padding: 0.35rem; max-height: 280px; overflow-y: auto;
  }
  .ms-opt { display: flex; align-items: flex-start; gap: 0.6rem; padding: 0.55rem 0.6rem; border-radius: 8px; cursor: pointer; font-size: 0.95rem; color: var(--ink); }
  .ms-opt:hover { background: var(--sand, #f4efe4); }
  .ms-opt input { margin-top: 0.15rem; flex: none; }
</style>
