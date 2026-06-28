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
export async function sendEmail({ to, subject, html, replyTo }) {
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
      body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) })
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
      ['Source', lead.source],
      ['Message', lead.message]
    ],
    adminUrl,
    'Guri Escapes Pongwe — you can reply directly to this email to reach the lead.'
  );
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
