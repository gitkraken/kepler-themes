import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canonicalHash, canonicalJson } from '../lib/canonical-hash.mjs';
import { comparePrecedence, isSemver } from '../lib/semver.mjs';

test('canonical hash ignores key order and whitespace but not array order', () => {
  const a = JSON.parse('{"b": 1, "a": {"y": [1, 2], "x": "é"}}');
  const b = JSON.parse('{"a":{"x":"é","y":[1,2]},"b":1}');
  assert.equal(canonicalJson(a), '{"a":{"x":"é","y":[1,2]},"b":1}');
  assert.equal(canonicalHash(a), canonicalHash(b));
  assert.notEqual(canonicalHash({ y: [1, 2] }), canonicalHash({ y: [2, 1] }));
});

test('canonical hash matches the vector computed by Kepler', () => {
  // Kepler computed this hash from the same text. The keys cover UTF-16 ordering (an emoji's
  // surrogates sort before U+FFFF), and the numbers cover how JSON.stringify spells them.
  const text =
    '{"z":1,"a":[3,1,{"b":true,"B":null}],"\\uffff":"x","\\ud83d\\ude00":"emoji","é":"\\u2028\\"","n":[1.0,1e21,-0,0.5]}';
  assert.equal(
    canonicalHash(JSON.parse(text)),
    '8661bb2f5b51fcb3877cb2f33df7d782eb591890d623dc4938877c53a49fb553',
  );
});

test('semver precedence follows semver.org, prereleases included', () => {
  // The ordering semver.org 11.2 and 11.4 spell out.
  const ordered = [
    '1.0.0-alpha',
    '1.0.0-alpha.1',
    '1.0.0-alpha.beta',
    '1.0.0-beta',
    '1.0.0-beta.2',
    '1.0.0-beta.11',
    '1.0.0-rc.1',
    '1.0.0',
    '1.0.1',
    '1.1.0',
    '2.0.0',
    '10.0.0',
  ];
  for (let i = 0; i < ordered.length - 1; i++) {
    assert.ok(comparePrecedence(ordered[i], ordered[i + 1]) < 0, `${ordered[i]} < ${ordered[i + 1]}`);
    assert.ok(comparePrecedence(ordered[i + 1], ordered[i]) > 0);
  }
  assert.equal(comparePrecedence('1.0.0+a', '1.0.0+b'), 0);
  assert.equal(comparePrecedence('1.2.3', '1.2.3'), 0);
});

test('isSemver rejects what semver.org rejects', () => {
  for (const ok of ['0.0.0', '1.2.3-rc.1+build.5']) assert.ok(isSemver(ok), ok);
  for (const bad of ['1.2', '01.2.3', '1.2.3-', 'v1.2.3', 1, undefined]) assert.ok(!isSemver(bad), String(bad));
});
