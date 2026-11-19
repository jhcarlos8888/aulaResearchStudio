'use strict';

const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

/**
 * A service manager does not inherit a terminal's interactive PATH.
 * Check the user-configured CLI, standard PATH, and OpenCode's usual user
 * installation in that order, without launching a shell.
 */
function detectOpenCodeCli({
  env = process.env,
  home = os.homedir(),
  run = spawnSync
} = {}) {
  const candidates = [...new Set([
    env.OPENCODE_BIN?.trim(),
    'opencode',
    path.join(home, '.opencode', 'bin', 'opencode')
  ].filter(Boolean))];

  for (const binary of candidates) {
    let result;
    try {
      result = run(binary, ['--version'], {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true
      });
    } catch {
      continue;
    }
    if (result?.error || result?.status !== 0) continue;
    const version = (result.stdout || result.stderr || '').trim().split('\n')[0] || null;
    return { available: true, version };
  }
  return { available: false, version: null };
}

module.exports = { detectOpenCodeCli };
