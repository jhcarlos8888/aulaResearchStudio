'use strict';

/**
 * The health endpoint returns OpenCode discovery state, not proof that an
 * inference or an academic agent has responded.
 */
function isValidHealthResponse(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  if (payload.ok !== true || typeof payload.opencodeAvailable !== 'boolean') return false;
  if (!Object.hasOwn(payload, 'opencodeVersion')) return false;
  if (payload.opencodeVersion !== null &&
      (typeof payload.opencodeVersion !== 'string' || !payload.opencodeVersion.trim())) {
    return false;
  }
  // A successful CLI --version call may produce no text. In that valid case
  // the CLI is available but its version remains null.
  return payload.opencodeAvailable || payload.opencodeVersion === null;
}

module.exports = { isValidHealthResponse };
