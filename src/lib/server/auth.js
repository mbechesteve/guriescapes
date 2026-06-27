import { randomBytes, timingSafeEqual, createHash, createHmac } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

export const SESSION_COOKIE = 'guri_admin';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function adminUsername() {
  const u = env.ADMIN_USERNAME;
  if (!u) {
    if (!dev) throw new Error('ADMIN_USERNAME is required in production.');
    return 'admin';
  }
  return u;
}

function adminPassword() {
  const pw = env.ADMIN_PASSWORD;
  if (!pw) {
    // Fail closed in production; allow a known dev default only in `npm run dev`.
    if (!dev) throw new Error('ADMIN_PASSWORD is required in production.');
    return 'guri-admin';
  }
  return pw;
}

/** Constant-time equality that doesn't leak length via early return. */
function safeEqual(input, expected) {
  const a = Buffer.from(String(input));
  const b = Buffer.from(String(expected));
  // Compare against a fixed-length digest so length differences don't short-circuit.
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}

/** Constant-time username + password check. */
export function checkCredentials(username, password) {
  if (!username || !password) return false;
  const okUser = safeEqual(username, adminUsername());
  const okPass = safeEqual(password, adminPassword());
  return okUser && okPass;
}

/** A fresh, unguessable session id (256 bits) generated per login. */
export function createSessionToken() {
  return randomBytes(32).toString('hex');
}

function sessionSecret() {
  const s = env.SESSION_SECRET;
  if (!s) {
    if (!dev) throw new Error('SESSION_SECRET is required in production.');
    return 'dev-only-session-secret';
  }
  return s;
}

/** Cookie value = "<token>.<hmac>" — lets us reject forged cookies before any DB hit. */
export function signToken(token) {
  const sig = createHmac('sha256', sessionSecret()).update(token).digest('base64url');
  return `${token}.${sig}`;
}

/** Returns the token if the signature is valid, else null. */
export function verifyToken(value) {
  if (!value || typeof value !== 'string') return null;
  const i = value.lastIndexOf('.');
  if (i < 1) return null;
  const token = value.slice(0, i);
  const sig = value.slice(i + 1);
  const expected = createHmac('sha256', sessionSecret()).update(token).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? token : null;
}
