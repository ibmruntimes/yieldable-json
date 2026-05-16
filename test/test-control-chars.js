'use strict';

// Behavior probe for ASCII control characters U+0000..U+001F.
// Compares yieldable-json output against the built-in JSON for both
// stringify and parse, and drills down per code point.

const tap = require('tap');
const yj = require('../');

function stringifyAsync(value) {
  return new Promise((resolve, reject) => {
    yj.stringifyAsync(value, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function parseAsync(text) {
  return new Promise((resolve, reject) => {
    yj.parseAsync(text, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function allControlChars() {
  let s = '';
  for (let i = 0x00; i <= 0x1f; i++) s += String.fromCharCode(i);
  return s;
}

function hex(i) {
  return '0x' + i.toString(16).padStart(2, '0');
}

tap.test('stringify: string containing every control char 0x00-0x1F', async (t) => {
  const input = { ctrl: allControlChars() };
  const expected = JSON.stringify(input);
  const actual = await stringifyAsync(input);
  t.equal(actual, expected, 'matches built-in JSON.stringify');
});

tap.test('parse: round-trip of every control char 0x00-0x1F', async (t) => {
  const original = { ctrl: allControlChars() };
  const encoded = JSON.stringify(original);
  const decoded = await parseAsync(encoded);
  t.same(decoded, original, 'round-trip preserves all control characters');
});

tap.test('stringify: per-code-point behavior 0x00-0x1F', async (t) => {
  for (let i = 0x00; i <= 0x1f; i++) {
    const obj = { v: String.fromCharCode(i) };
    const expected = JSON.stringify(obj);
    const actual = await stringifyAsync(obj);
    t.equal(actual, expected, `stringify ${hex(i)}`);
  }
});

tap.test('parse: per-code-point round-trip 0x00-0x1F', async (t) => {
  for (let i = 0x00; i <= 0x1f; i++) {
    const obj = { v: String.fromCharCode(i) };
    const encoded = JSON.stringify(obj);
    const decoded = await parseAsync(encoded);
    t.same(decoded, obj, `parse ${hex(i)}`);
  }
});
