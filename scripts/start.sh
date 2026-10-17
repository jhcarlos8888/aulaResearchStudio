#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ ! -d node_modules ]]; then
  echo "No se encuentran las dependencias. Ejecuta primero ./scripts/setup.sh" >&2
  exit 1
fi
exec npm start
