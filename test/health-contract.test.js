'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidHealthResponse } = require('../lib/health-contract');

test('health schema accepts available OpenCode with non-empty version', () => {
  assert.equal(isValidHealthResponse({ ok: true, opencodeAvailable: true, opencodeVersion: 'opencode v2.1.4' }), true);
});

test('health schema accepts successful CLI discovery with unknown version', () => {
  assert.equal(isValidHealthResponse({ ok: true, opencodeAvailable: true, opencodeVersion: null }), true);
});

test('health schema accepts unavailable OpenCode with null version', () => {
  assert.equal(isValidHealthResponse({ ok: true, opencodeAvailable: false, opencodeVersion: null }), true);
});

test('health schema fails when any required field is missing', () => {
  for (const sample of [
    { ok: true, opencodeVersion: null },
    { ok: true, opencodeAvailable: true },
    { opencodeAvailable: false, opencodeVersion: null },
    null,
    []
  ]) assert.equal(isValidHealthResponse(sample), false);
});

test('health schema rejects false types and inconsistent states', () => {
  for (const sample of [
    { ok: 'true', opencodeAvailable: true, opencodeVersion: 'v2' },
    { ok: true, opencodeAvailable: 'true', opencodeVersion: 'v2' },
    { ok: true, opencodeAvailable: true, opencodeVersion: '' },
    { ok: true, opencodeAvailable: false, opencodeVersion: 'v2' },
    { ok: true, opencodeAvailable: false, opencodeVersion: false }
  ]) assert.equal(isValidHealthResponse(sample), false);
});
