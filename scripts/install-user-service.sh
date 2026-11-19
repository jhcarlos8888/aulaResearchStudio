#!/usr/bin/env bash
# Instala Aula Research Studio como servicio del usuario actual (sin sudo).
# El servicio no depende de la sesión temporal de ningún agente OpenCode.
set -euo pipefail

APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
SERVICE_NAME="aula-research-studio.service"
SERVICE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
NODE_BIN="$(command -v node || true)"
OPENCODE_BIN="${OPENCODE_BIN:-$HOME/.opencode/bin/opencode}"

if ! command -v systemctl >/dev/null 2>&1; then
  echo "ERROR: systemctl no está disponible en este sistema." >&2
  exit 1
fi
if [[ -z "$NODE_BIN" || "$NODE_BIN" != /* || ! -x "$NODE_BIN" ]]; then
  echo "ERROR: no se encontró un ejecutable absoluto de Node.js." >&2
  exit 1
fi
if [[ ! -f "$APP_ROOT/server.js" || ! -f "$APP_ROOT/package.json" ]]; then
  echo "ERROR: carpeta de proyecto incompleta." >&2
  exit 1
fi
if [[ ! -x "$OPENCODE_BIN" ]]; then
  OPENCODE_BIN="$(command -v opencode || true)"
fi
# Never silently use an invalid executable path. Detection may still find PATH.
if [[ -n "$OPENCODE_BIN" && "$OPENCODE_BIN" != /* ]]; then
  OPENCODE_BIN=""
fi

mkdir -p "$SERVICE_DIR"
UNIT_FILE="$SERVICE_DIR/$SERVICE_NAME"
# A stable user-local symlink avoids systemd's path escaping ambiguity for
# project locations containing spaces, without relocating data or source code.
SERVICE_LINK="$HOME/.local/share/aula-research-studio"
mkdir -p "$(dirname "$SERVICE_LINK")"
if [[ -L "$SERVICE_LINK" ]]; then
  if [[ "$(readlink -f -- "$SERVICE_LINK")" != "$APP_ROOT" ]]; then
    echo "ERROR: el enlace $SERVICE_LINK apunta a otro proyecto." >&2
    exit 1
  fi
elif [[ -e "$SERVICE_LINK" ]]; then
  echo "ERROR: $SERVICE_LINK ya existe y no es un enlace administrado." >&2
  exit 1
else
  ln -s -- "$APP_ROOT" "$SERVICE_LINK"
fi
cat > "$UNIT_FILE" <<EOF
[Unit]
Description=Aula Research Studio local web app
After=network.target

[Service]
Type=simple
WorkingDirectory=$SERVICE_LINK
ExecStart=$NODE_BIN server.js
Environment=NODE_ENV=production
Environment=HOST=127.0.0.1
Environment=PORT=4173
Environment="OPENCODE_BIN=$OPENCODE_BIN"
# El servicio debe recuperarse de señales de agentes que matan el proceso
# por error, incluso si systemd interpreta SIGTERM como salida limpia.
# systemctl --user stop sigue respetando una parada humana explícita.
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF

systemd-analyze --user verify "$UNIT_FILE"
systemctl --user daemon-reload
systemctl --user enable "$SERVICE_NAME"
systemctl --user restart "$SERVICE_NAME"
python3 - <<'PYHEALTH'
import json, time, urllib.request
url = "http://127.0.0.1:4173/api/health"
for _ in range(30):
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            payload = json.load(response)
        if payload.get("ok") is True and payload.get("opencodeAvailable") is True:
            print("PASS: Aula disponible y OpenCode detectado:", payload.get("opencodeVersion"))
            raise SystemExit(0)
    except (OSError, ValueError):
        pass
    time.sleep(1)
raise SystemExit("ERROR: Aula no confirmó el estado saludable ni la disponibilidad de OpenCode.")
PYHEALTH
echo "Servicio $SERVICE_NAME habilitado. URL: http://127.0.0.1:4173"
