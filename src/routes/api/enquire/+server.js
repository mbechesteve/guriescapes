import { json, error } from '@sveltejs/kit';
import { enquiries } from '$lib/server/db';

const str = (v, max) => String(v ?? '').trim().slice(0, max);

export async function POST({ request }) {
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

  const doc = {
    firstname,
    lastname,
    email,
    phone: str(body.phone, 60),
    interest: str(body.interest, 120),
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

  return json({ ok: true });
}
