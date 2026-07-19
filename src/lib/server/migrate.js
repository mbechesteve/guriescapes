// Pure helpers for a non-destructive one-time content migration.
// No database access here — callers apply the returned $set patch.

/** Read a dotted path (supports numeric array indices). undefined if missing. */
export function getPath(obj, path) {
  let cur = obj;
  for (const key of path.split('.')) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur;
}

/** Whether a dotted path resolves to something present (not undefined). */
export function hasPath(obj, path) {
  return getPath(obj, path) !== undefined;
}

/** Structural equality good enough for strings/arrays/plain objects. */
export function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

/**
 * Compute a non-destructive $set patch for the site document.
 *  - additions: { dottedPath: defaultValue } — added only if the path is absent.
 *  - corrections: [{ path, oldValue, newValue }] — applied only if current value
 *    still deep-equals oldValue (i.e. the field was never hand-edited).
 * Returns { $set } or null when there is nothing to change.
 */
export function computeSiteMigration(current, additions = {}, corrections = []) {
  const set = {};
  for (const [path, value] of Object.entries(additions)) {
    if (!hasPath(current, path)) set[path] = value;
  }
  for (const { path, oldValue, newValue } of corrections) {
    if (deepEqual(getPath(current, path), oldValue)) set[path] = newValue;
  }
  return Object.keys(set).length ? { $set: set } : null;
}
