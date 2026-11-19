'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { detectOpenCodeCli } = require('../lib/opencode-detection');

test('detects executable from the default user installation when PATH misses it', () => {
  const attempted = [];
  const detected = detectOpenCodeCli({
    env: {},
    home: '/home/demo',
    run: (binary, args) => {
      attempted.push({ binary, args });
      return binary === '/home/demo/.opencode/bin/opencode'
        ? { status: 0, stdout: '2.1.4\n' }
        : { status: null, error: new Error('ENOENT') };
    }
  });
  assert.deepEqual(detected, { available: true, version: '2.1.4' });
  assert.deepEqual(attempted.map((item) => item.binary), ['opencode', '/home/demo/.opencode/bin/opencode']);
  assert.ok(attempted.every((item) => item.args.length === 1 && item.args[0] === '--version'));
});

test('honors OPENCODE_BIN from an isolated service environment', () => {
  const attempted = [];
  const result = detectOpenCodeCli({
    env: { OPENCODE_BIN: '/custom/bin/opencode' },
    home: '/home/demo',
    run: (binary) => {
      attempted.push(binary);
      return { status: 0, stdout: '2.1.5\n' };
    }
  });
  assert.deepEqual(result, { available: true, version: '2.1.5' });
  assert.deepEqual(attempted, ['/custom/bin/opencode']);
});

test('returns unavailable when every candidate fails', () => {
  const result = detectOpenCodeCli({
    env: {},
    home: '/home/demo',
    run: () => ({ status: 1, stderr: 'error' })
  });
  assert.deepEqual(result, { available: false, version: null });
});

test('does not run shell commands for executable discovery', () => {
  const run = (binary, args, options) => {
    assert.equal(options.shell, undefined);
    assert.deepEqual(args, ['--version']);
    return { status: 0, stdout: '2.1.4' };
  };
  assert.equal(detectOpenCodeCli({ env: { OPENCODE_BIN: '/safe/bin/opencode' }, run }).available, true);
});
