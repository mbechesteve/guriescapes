import { fail } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { enquiries, pageviews } from '$lib/server/db';

const STATUSES = ['New', 'Contacted', 'Viewing', 'Negotiating', 'Won', 'Lost'];

const PAGE_LABELS = {
  '/': 'Home',
  '/villa-a': 'Villa A',
  '/villa-b': 'Villa B'
};

export async function load() {
  let items = [];
  let views = [];
  let totalViews = 0;
  let viewsLast7 = 0;
  let dbError = null;

  try {
    const col = await enquiries();
    items = await col.find({}).sort({ createdAt: -1 }).limit(1000).toArray();
  } catch (e) {
    console.error('Failed to load enquiries:', e);
    dbError = 'Could not connect to the database. Check MONGODB_URI.';
  }

  try {
    const pv = await pageviews();
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const agg = await pv
      .aggregate([
        {
          $group: {
            _id: '$path',
            count: { $sum: 1 },
            last7: { $sum: { $cond: [{ $gte: ['$createdAt', since] }, 1, 0] } }
          }
        },
        { $sort: { count: -1 } }
      ])
      .toArray();
    views = agg.map((r) => ({ path: r._id, label: PAGE_LABELS[r._id] || r._id, count: r.count, last7: r.last7 }));
    totalViews = views.reduce((s, r) => s + r.count, 0);
    viewsLast7 = views.reduce((s, r) => s + r.last7, 0);
  } catch (e) {
    console.error('Failed to load analytics:', e);
  }

  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const it of items) {
    const s = STATUSES.includes(it.status) ? it.status : 'New';
    statusCounts[s]++;
  }

  return {
    dbError,
    statuses: STATUSES,
    statusCounts,
    analytics: { views, totalViews, viewsLast7 },
    enquiries: items.map((d) => ({
      id: d._id.toString(),
      firstname: d.firstname || '',
      lastname: d.lastname || '',
      email: d.email || '',
      phone: d.phone || '',
      interest: d.interest || '',
      message: d.message || '',
      source: d.source || '',
      status: STATUSES.includes(d.status) ? d.status : 'New',
      notes: d.notes || '',
      nextStep: d.nextStep || '',
      nextStepDate: d.nextStepDate ? new Date(d.nextStepDate).toISOString().slice(0, 10) : '',
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null
    }))
  };
}

export const actions = {
  update: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id') || '');
    if (!ObjectId.isValid(id)) return fail(400, { error: 'Invalid lead id' });

    const status = STATUSES.includes(fd.get('status')) ? fd.get('status') : 'New';
    const notes = String(fd.get('notes') || '').slice(0, 4000);
    const nextStep = String(fd.get('nextStep') || '').slice(0, 500);
    const rawDate = String(fd.get('nextStepDate') || '').trim();
    const nextStepDate = rawDate ? new Date(rawDate) : null;

    try {
      const col = await enquiries();
      await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, notes, nextStep, nextStepDate, updatedAt: new Date() } }
      );
    } catch (e) {
      console.error('Failed to update lead:', e);
      return fail(500, { error: 'Could not save changes' });
    }
    return { success: true, id };
  }
};
