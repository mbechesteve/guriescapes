// Store a brochure PDF in MongoDB and point site content at it, so the
// enquiry auto-reply attaches it. Run against any environment by setting
// MONGODB_URI / MONGODB_DB (defaults match local dev):
//
//   node scripts/set-brochure.js "/path/to/Brochure.pdf"
//
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { MongoClient } from 'mongodb';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node scripts/set-brochure.js <path-to-pdf>');
  process.exit(1);
}

const buf = readFileSync(path);
if (buf.toString('ascii', 0, 5) !== '%PDF-') {
  console.error('Not a PDF:', path);
  process.exit(1);
}
if (buf.length > 15 * 1024 * 1024) {
  console.error(`PDF is ${(buf.length / 1e6).toFixed(1)}MB — keep it under 15MB (MongoDB document limit).`);
  process.exit(1);
}

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'guriescapes';
const name = basename(path).replace(/[^\w.\- ]+/g, '').slice(0, 120) || 'brochure.pdf';

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  const r = await db.collection('documents').insertOne({
    data: buf,
    contentType: 'application/pdf',
    name,
    size: buf.length,
    createdAt: new Date()
  });
  const fileUrl = `/api/doc/${r.insertedId.toString()}`;
  // No upsert: the app seeds the full site doc on first load, and a brochure-only
  // doc here would stop that seeding from ever running.
  const u = await db.collection('siteContent').updateOne(
    { _id: 'site' },
    { $set: { brochure: { fileUrl, name, uploadedAt: new Date() } } }
  );
  if (u.matchedCount === 0) {
    console.error('Site content doc not found — open the site once so it seeds, then re-run.');
    process.exit(1);
  }
  console.log(`Stored ${name} (${(buf.length / 1e6).toFixed(1)}MB) → ${fileUrl}`);
} finally {
  await client.close();
}
