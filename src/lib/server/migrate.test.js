import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeSiteMigration, getPath, deepEqual } from './migrate.js';

test('adds only absent additions', () => {
  const current = { hero: { headline: 'Edited' }, contact: { email: 'a@b.com' } };
  const additions = { 'developer.heading': 'Dev', 'contact.calendly': '', 'hero.headline': 'X' };
  const patch = computeSiteMigration(current, additions, []);
  assert.deepEqual(patch, { $set: { 'developer.heading': 'Dev', 'contact.calendly': '' } });
});

test('applies a correction only when value still equals old default', () => {
  const current = { metrics: [{ cap: 'Projected land growth to 2026*' }, { cap: 'kept' }] };
  const corrections = [
    { path: 'metrics.0.cap', oldValue: 'Projected land growth to 2026*', newValue: 'Projected land growth to 2027*' },
    { path: 'metrics.1.cap', oldValue: 'was-something-else', newValue: 'should-not-apply' }
  ];
  const patch = computeSiteMigration(current, {}, corrections);
  assert.deepEqual(patch, { $set: { 'metrics.0.cap': 'Projected land growth to 2027*' } });
});

test('returns null when nothing changes', () => {
  const current = { developer: { heading: 'Dev' } };
  assert.equal(computeSiteMigration(current, { 'developer.heading': 'X' }, []), null);
});

test('getPath reads nested + array indices; deepEqual compares arrays', () => {
  assert.equal(getPath({ a: { b: [10, 20] } }, 'a.b.1'), 20);
  assert.equal(getPath({}, 'x.y'), undefined);
  assert.ok(deepEqual([1, { q: 'a' }], [1, { q: 'a' }]));
  assert.ok(!deepEqual([1], [2]));
});
