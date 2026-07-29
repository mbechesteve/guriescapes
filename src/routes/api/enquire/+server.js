import { json, error } from '@sveltejs/kit';
import { read } from '$app/server';
import { enquiries, documents } from '$lib/server/db';
import { sendEmail, notifyAddress, newEnquiryEmail, brochureEmail, enquiryAckEmail } from '$lib/server/email';
import { getSiteContent } from '$lib/server/content';
import { ObjectId } from 'mongodb';
import bundledBrochure from '$lib/assets/brochure.pdf';

const str = (v, max) => String(v ?? '').trim().slice(0, max);

export async function POST({ request, url }) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid request body');
  }

  const firstname = str(body.firstname, 120);
  const lastname = str(body.lastname, 120);
  const email = str(body.email, 200);

  if (!firstname || !lastname || !email) {
    throw error(400, 'Please provide your name and email.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw error(400, 'Please provide a valid email address.');
  }

  const helpRaw = Array.isArray(body.help) ? body.help : (body.help ? [body.help] : []);
  const help = helpRaw.map((h) => str(h, 120)).filter(Boolean).slice(0, 12);
  const timeframe = str(body.timeframe, 60);

  const doc = {
    firstname,
    lastname,
    email,
    phone: str(body.phone, 60),
    interest: str(body.interest, 120),
    help,
    timeframe,
    message: str(body.message, 4000),
    source: str(body.source, 40),
    createdAt: new Date(),
    status: 'New',
    notes: '',
    nextStep: '',
    nextStepDate: null,
    updatedAt: null
  };

  try {
    const col = await enquiries();
    await col.insertOne(doc);
  } catch (e) {
    console.error('Failed to save enquiry:', e);
    throw error(500, 'Could not save your enquiry. Please try again.');
  }

  // Notify the team (best-effort — never block or fail the response on email).
  try {
    const to = await notifyAddress();
    if (to) {
      await sendEmail({
        to,
        subject: `New enquiry — ${doc.firstname} ${doc.lastname}`,
        html: newEnquiryEmail(doc, `${url.origin}/admin`),
        replyTo: doc.email
      });
    }
  } catch (e) {
    console.error('Enquiry notification failed:', e);
  }

  // Auto-reply to every enquirer (best-effort). An admin-uploaded brochure in
  // the DB wins; otherwise we attach the brochure bundled with the app. Only
  // if both fail do we fall back to a receipt-confirmation without the PDF.
  try {
    const site = await getSiteContent();
    const contact = site?.contact || {};
    let attachments;
    try {
      const b = site?.brochure || {};
      const m = b.fileUrl ? /\/api\/doc\/([a-f0-9]{24})/.exec(b.fileUrl) : null;
      if (m) {
        const col = await documents();
        const fileDoc = await col.findOne({ _id: new ObjectId(m[1]) });
        if (fileDoc?.data) {
          const bin = fileDoc.data;
          const bytes = bin && bin.buffer ? Buffer.from(bin.buffer) : Buffer.from(bin);
          attachments = [{ filename: fileDoc.name || 'Pongwe Villas - Guri Escapes Brochure.pdf', content: bytes.toString('base64') }];
        }
      }
      if (!attachments) {
        const bytes = Buffer.from(await read(bundledBrochure).arrayBuffer());
        attachments = [{ filename: 'Pongwe Villas - Guri Escapes Brochure.pdf', content: bytes.toString('base64') }];
      }
    } catch (e) {
      console.error('Brochure attachment failed:', e);
    }
    if (attachments) {
      await sendEmail({
        to: doc.email,
        subject: 'Thank you for your interest in Pongwe Villas',
        html: brochureEmail(doc, true, contact),
        attachments
      });
    } else {
      await sendEmail({
        to: doc.email,
        subject: "We've received your enquiry — your Pongwe brochure is on its way",
        html: enquiryAckEmail(doc, contact)
      });
    }
  } catch (e) {
    console.error('Enquirer auto-reply failed:', e);
  }

  return json({ ok: true });
}
