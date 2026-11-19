const assert = require("node:assert/strict");
const test = require("node:test");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

test("user service recovers from accidental SIGTERM without tolerating broad process kill", () => {
  const script = readFileSync(join(process.cwd(), "scripts/install-user-service.sh"), "utf8");
  assert.match(script, /^Restart=always$/m);
  assert.match(script, /^RestartSec=3$/m);
  assert.doesNotMatch(script, /pkill\s+-f|killall|fuser\s+-k/);
});
