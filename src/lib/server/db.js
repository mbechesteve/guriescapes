import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

const uri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = env.MONGODB_DB || 'guriescapes';

let clientPromise;

function connect() {
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb() {
  const client = await connect();
  return client.db(dbName);
}

let enquiriesIndexed = false;
export async function enquiries() {
  const db = await getDb();
  const col = db.collection('enquiries');
  if (!enquiriesIndexed) {
    enquiriesIndexed = true;
    try {
      await col.createIndex({ createdAt: -1 });
      await col.createIndex({ status: 1 });
      await col.createIndex({ source: 1 });
    } catch {
      enquiriesIndexed = false;
    }
  }
  return col;
}

export async function pageviews() {
  const db = await getDb();
  return db.collection('pageviews');
}

export async function siteContent() {
  const db = await getDb();
  return db.collection('siteContent');
}

let villasIndexed = false;
export async function villas() {
  const db = await getDb();
  const col = db.collection('villas');
  if (!villasIndexed) {
    villasIndexed = true;
    try {
      await col.createIndex({ slug: 1 }, { unique: true });
      await col.createIndex({ order: 1 });
    } catch {
      villasIndexed = false;
    }
  }
  return col;
}

let sessionsIndexed = false;
export async function sessions() {
  const db = await getDb();
  const col = db.collection('sessions');
  if (!sessionsIndexed) {
    sessionsIndexed = true;
    try {
      await col.createIndex({ token: 1 }, { unique: true });
      // TTL index: Mongo auto-removes sessions once expiresAt passes.
      await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    } catch {
      sessionsIndexed = false; // retry next time if it failed
    }
  }
  return col;
}
