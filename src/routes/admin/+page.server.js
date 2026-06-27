import { enquiries } from '$lib/server/db';

export async function load() {
  let items = [];
  let dbError = null;
  try {
    const col = await enquiries();
    items = await col.find({}).sort({ createdAt: -1 }).limit(1000).toArray();
  } catch (e) {
    console.error('Failed to load enquiries:', e);
    dbError = 'Could not connect to the database. Check MONGODB_URI.';
  }

  return {
    dbError,
    enquiries: items.map((d) => ({
      id: d._id.toString(),
      firstname: d.firstname || '',
      lastname: d.lastname || '',
      email: d.email || '',
      phone: d.phone || '',
      interest: d.interest || '',
      message: d.message || '',
      source: d.source || '',
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null
    }))
  };
}
