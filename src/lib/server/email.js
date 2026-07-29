import { env } from '$env/dynamic/private';
import { getSiteContent } from './content';

/** Escape user-supplied text before putting it into email HTML. */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/** Where team notifications go: MAIL_TO env, else the site contact email. */
export async function notifyAddress() {
  if (env.MAIL_TO) return env.MAIL_TO;
  try {
    const s = await getSiteContent();
    return s?.contact?.email || null;
  } catch {
    return null;
  }
}

/** Send an email via Resend. No-ops (logs) if RESEND_API_KEY isn't set. */
export async function sendEmail({ to, subject, html, replyTo, attachments }) {
  if (!env.RESEND_API_KEY) {
    console.warn('Email skipped: RESEND_API_KEY not set.');
    return false;
  }
  if (!to) {
    console.warn('Email skipped: no recipient.');
    return false;
  }
  const from = env.MAIL_FROM || 'Guri Escapes <onboarding@resend.dev>';
  const endpoint = env.RESEND_API_URL || 'https://api.resend.com/emails';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        from, to, subject, html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments && attachments.length ? { attachments } : {})
      })
    });
    if (!res.ok) {
      console.error('Resend error', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (e) {
    console.error('Email send failed:', e);
    return false;
  }
}

function shell(title, rows, adminUrl, footer) {
  const cells = rows
    .filter((r) => r[1])
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px;color:#5a5c45;font-size:13px;width:140px;vertical-align:top">${esc(k)}</td><td style="padding:6px 14px;color:#2b2e18;font-size:14px">${esc(v)}</td></tr>`
    )
    .join('');
  return `<div style="background:#FCF8EF;padding:24px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7e0d3;border-radius:14px;overflow:hidden">
    <div style="background:#363a17;color:#FCF8EF;padding:18px 22px;font-size:18px;font-weight:600">${esc(title)}</div>
    <table style="width:100%;border-collapse:collapse;margin:8px 0">${cells}</table>
    <div style="padding:16px 22px 22px">
      <a href="${esc(adminUrl)}" style="display:inline-block;background:#BE8F5B;color:#fff;text-decoration:none;padding:11px 22px;border-radius:50px;font-size:14px">Open in admin →</a>
    </div>
  </div>
  ${footer ? `<p style="text-align:center;color:#9a9580;font-size:12px;margin:14px 0 0">${esc(footer)}</p>` : ''}
</div>`;
}

export function newEnquiryEmail(lead, adminUrl) {
  return shell(
    'New enquiry',
    [
      ['Name', `${lead.firstname} ${lead.lastname}`],
      ['Email', lead.email],
      ['Phone', lead.phone],
      ['Interested in', lead.interest],
      ['How we can help', Array.isArray(lead.help) ? lead.help.join(', ') : lead.help],
      ['Timeframe', lead.timeframe],
      ['Source', lead.source],
      ['Message', lead.message]
    ],
    adminUrl,
    'Guri Escapes Pongwe — you can reply directly to this email to reach the lead.'
  );
}

/**
 * Enquirer-facing shell in the brochure-envelope style: letterspaced brand
 * mark, large serif headline, short divider, italic subline, then body copy.
 */
function enquirerShell(subline, bodyHtml) {
  return `<div style="background:#F6F1E5;padding:40px 20px;font-family:Georgia,'Times New Roman',serif">
  <div style="max-width:560px;margin:0 auto;text-align:center">
    <div style="padding:36px 24px 30px">
      <div style="color:#2b2416;font-size:26px;letter-spacing:7px;line-height:1.35">PONGWE<br>VILLAS</div>
      <div style="color:#5a5138;font-size:10px;letter-spacing:4px;margin-top:10px">BY&nbsp;&nbsp;GURI&nbsp;&nbsp;ESCAPES</div>
    </div>
    <div style="padding:26px 24px 0">
      <div style="color:#4a4331;font-size:30px;line-height:1.4">Thank you for your interest in Pongwe Villas.</div>
      <div style="width:44px;height:2px;background:#6b5b40;margin:26px auto"></div>
      <div style="color:#6f6750;font-size:16px;font-style:italic;line-height:1.7">${subline}</div>
    </div>
    <div style="padding:30px 24px 10px;color:#4a4331;font-size:15px;line-height:1.7;text-align:center">${bodyHtml}</div>
    <div style="padding:26px 24px 8px;color:#9a9280;font-size:12px;letter-spacing:1px">GURI ESCAPES · PONGWE, ZANZIBAR</div>
  </div>
</div>`;
}

function enquirerCtas(contact = {}) {
  const wa = contact.whatsapp ? `https://wa.me/${esc(contact.whatsapp)}` : '';
  const cal = contact.calendly ? esc(contact.calendly) : '';
  const btn = cal
    ? `<p style="margin:22px 0 0"><a href="${cal}" style="display:inline-block;background:#BE8F5B;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:14px;font-family:Arial,Helvetica,sans-serif">Book a free discovery call</a></p>`
    : '';
  const alt = wa
    ? `<p style="margin:14px 0 0">Questions? Reply to this email or message us on <a href="${wa}" style="color:#BE8F5B">WhatsApp</a>.</p>`
    : `<p style="margin:14px 0 0">Questions? Simply reply to this email.</p>`;
  return btn + alt;
}

/** Sent to the enquirer when they request the brochure (attached if we have a stored PDF). */
export function brochureEmail(lead, hasPdf, contact = {}) {
  const name = esc(lead.firstname || 'there');
  const subline = hasPdf
    ? 'Your brochure and price list are attached — and you’re now on our list to receive exclusive offers, availability updates, and insider news.'
    : 'You’re now on our list to receive exclusive offers, availability updates, and insider news.';
  const body = `<p style="margin:0">Hi ${name},</p>
      <p style="margin:14px 0 0">${hasPdf
        ? 'The Pongwe Villas brochure and price list are attached to this email as a PDF.'
        : 'We’re preparing the latest brochure and price list and will email it to you very shortly.'}</p>
      <p style="margin:14px 0 0">Two design-led private pool villas on Zanzibar’s calm east coast — fully managed for hands-off rental income, from USD 90,000.</p>
      ${enquirerCtas(contact)}
      <p style="margin:22px 0 0;color:#6f6750">— The Guri Escapes team</p>`;
  return enquirerShell(subline, body);
}

/** Auto-reply to every enquirer: confirms receipt and promises the PDF shortly. */
export function enquiryAckEmail(lead, contact = {}) {
  const name = esc(lead.firstname || 'there');
  const subline = 'You’re now on our list to receive exclusive offers, availability updates, and insider news.';
  const body = `<p style="margin:0">Hi ${name},</p>
      <p style="margin:14px 0 0">We’ve received your details and a member of our team will email you the full brochure and price list (PDF) shortly.</p>
      <p style="margin:14px 0 0">In the meantime: two design-led private pool villas on Zanzibar’s calm east coast, fully managed for hands-off rental income, from USD 90,000.</p>
      ${enquirerCtas(contact)}
      <p style="margin:22px 0 0;color:#6f6750">— The Guri Escapes team</p>`;
  return enquirerShell(subline, body);
}

export function leadUpdateEmail(lead, adminUrl) {
  return shell(
    'Lead updated',
    [
      ['Name', `${lead.firstname} ${lead.lastname}`],
      ['Email', lead.email],
      ['Status', lead.status],
      ['Next step', lead.nextStep],
      ['Follow-up', lead.nextStepDate],
      ['Notes', lead.notes]
    ],
    adminUrl,
    'Guri Escapes Pongwe — lead pipeline update.'
  );
}
