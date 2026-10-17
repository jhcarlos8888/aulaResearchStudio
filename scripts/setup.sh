#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: No se encontró Node.js. Instala Node.js 20 o superior y vuelve a ejecutar este script." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: No se encontró npm. Instala npm junto con Node.js." >&2
  exit 1
fi
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if (( NODE_MAJOR < 20 )); then
  echo "ERROR: Se requiere Node.js 20+. Tu versión es $(node --version)." >&2
  exit 1
fi
mkdir -p data workspace/projects workspace/exports
if [[ ! -f data/projects.json ]]; then printf '[]\n' > data/projects.json; fi
npm install
chmod +x scripts/*.sh
cat <<'MESSAGE'

Instalación completada.

Siguiente paso:
  ./scripts/start.sh

Después abre http://127.0.0.1:4173 en el navegador.
OpenCode y Playwright MCP se configuran aparte; consulta README.md.
MESSAGE
