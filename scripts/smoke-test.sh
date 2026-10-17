#!/usr/bin/env bash
# Batería de humo: verifica el flujo real de Aula Research Studio contra el
# servidor en ejecución.
#
# Aísla TODOS los datos de la prueba en un directorio temporal mediante
# AULA_DATA_DIR / AULA_WORKSPACE_DIR: no lee, escribe ni restaura los
# proyectos reales del usuario (ni siquiera si la app está abierta).
#
# Requisitos: node, python3, unzip, curl.
# Uso: ./scripts/smoke-test.sh   (o: npm run smoke)
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for tool in node python3 unzip curl; do
  if ! command -v "$tool" > /dev/null 2>&1; then
    echo "ERROR: falta '$tool', necesario para la batería de humo." >&2
    exit 1
  fi
done

TMP="$(mktemp -d 2>/dev/null || true)"
if [[ -z "$TMP" ]]; then
  echo "ERROR: no se pudo crear un directorio temporal. No se ejecuta ninguna prueba." >&2
  exit 1
fi

PORT="${SMOKE_PORT:-4399}"
if [[ ! "$PORT" =~ ^[0-9]+$ ]] || [[ "$PORT" -lt 1024 ]] || [[ "$PORT" -gt 65535 ]]; then
  echo "ERROR: SMOKE_PORT debe estar entre 1024 y 65535 (recibido: $PORT)." >&2
  rm -rf "$TMP"; exit 1
fi
if curl -s --max-time 1 "http://127.0.0.1:${PORT}/api/health" > /dev/null 2>&1; then
  echo "ERROR: ya hay algo escuchando en el puerto $PORT. Cierra esa sesión o usa otro SMOKE_PORT." >&2
  rm -rf "$TMP"; exit 1
fi

BASE="http://127.0.0.1:${PORT}"
SMOKE_DATA="$TMP/data"
SMOKE_WORKSPACE="$TMP/workspace"
PROJECTS_FILE="$SMOKE_DATA/projects.json"
PASS=0
FAIL=0
SERVER_PID=""
ID=""

cleanup() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

check() { # check <nombre> <0 = pasa>
  if [[ "$2" -eq 0 ]]; then
    PASS=$((PASS + 1)); echo "  PASS  $1"
  else
    FAIL=$((FAIL + 1)); echo "  FAIL  $1"
  fi
}

echo "== Arrancar servidor (puerto $PORT, datos aislados en $TMP) =="
PORT="$PORT" AULA_DATA_DIR="$SMOKE_DATA" AULA_WORKSPACE_DIR="$SMOKE_WORKSPACE" \
  node server.js > "$TMP/server.log" 2>&1 &
SERVER_PID=$!
for _ in $(seq 1 25); do
  curl -s --max-time 2 "$BASE/api/health" > /dev/null 2>&1 && break
  sleep 0.2
done
if curl -s --max-time 2 "$BASE/api/health" | grep -q '"ok":true'; then
  check "el servidor arranca y responde en /api/health" 0
else
  check "el servidor arranca y responde en /api/health" 1
  echo "  Log del servidor:"; sed 's/^/    /' "$TMP/server.log"
  echo; echo "Resultado: $PASS PASS / $FAIL FAIL"; exit 1
fi

echo "== Crear proyecto y comprobar el BRIEF =="
ID="$(curl -s --max-time 10 -X POST "$BASE/api/projects" -H 'Content-Type: application/json' \
  -d '{"title":"Proyecto de humo","topic":"Tema de prueba","apaVersion":"7","institution":"U. Prueba"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin).get("id",""))' 2>/dev/null)"
if [[ -n "$ID" ]]; then check "crear proyecto devuelve un id" 0; else check "crear proyecto devuelve un id" 1; fi
if grep -q "APA 7.ª edición" "$SMOKE_WORKSPACE/projects/$ID/BRIEF.md" 2>/dev/null; then
  check "el BRIEF muestra la norma como la ve el usuario (APA 7.ª edición)" 0
else
  check "el BRIEF muestra la norma como la ve el usuario (APA 7.ª edición)" 1
fi

echo "== Plantillas de proyecto y conservación de FUENTES.md =="
if grep -q "# Informe de revisión crítica" "$SMOKE_WORKSPACE/projects/$ID/INFORME_REVISION.md" 2>/dev/null; then
  check "INFORME_REVISION.md se crea desde su plantilla" 0
else
  check "INFORME_REVISION.md se crea desde su plantilla" 1
fi
if grep -q "# Bitácora de revisiones" "$SMOKE_WORKSPACE/projects/$ID/BITACORA_REVISIONES.md" 2>/dev/null; then
  check "BITACORA_REVISIONES.md se crea desde la plantilla MODELO_BITACORA" 0
else
  check "BITACORA_REVISIONES.md se crea desde la plantilla MODELO_BITACORA" 1
fi
# El profesor edita FUENTES.md a mano (sin marcadores): esas notas no deben
# perderse ni duplicarse cuando el servidor regenera el índice.
printf '# Mis notas manuales\n\nAnotación propia del profesor sobre una fuente.\n' > "$SMOKE_WORKSPACE/projects/$ID/FUENTES.md"
curl -s --max-time 10 -o /dev/null -X PUT "$BASE/api/projects/$ID" -H 'Content-Type: application/json' -d '{"course":"Curso humo"}'
curl -s --max-time 10 -o /dev/null -X PUT "$BASE/api/projects/$ID" -H 'Content-Type: application/json' -d '{"course":"Curso humo 2"}'
MANUAL_COUNT="$(grep -c 'Anotación propia del profesor' "$SMOKE_WORKSPACE/projects/$ID/FUENTES.md" 2>/dev/null || true)"
if [[ "$MANUAL_COUNT" == "1" ]]; then
  check "una edición manual de FUENTES.md se conserva tras dos regeneraciones (sin duplicar)" 0
else
  check "una edición manual de FUENTES.md se conserva tras dos regeneraciones (sin duplicar) (aparece ${MANUAL_COUNT:-0} veces)" 1
fi
if grep -q "Índice generado automáticamente" "$SMOKE_WORKSPACE/projects/$ID/FUENTES.md" 2>/dev/null; then
  check "el índice regenerado coexiste con las notas conservadas" 0
else
  check "el índice regenerado coexiste con las notas conservadas" 1
fi
# Regresión (repro del revisor): marcadores literales en el título del proyecto
# y citados dentro de las propias notas no deben borrar ni truncar el bloque.
curl -s --max-time 10 -o /dev/null -X PUT "$BASE/api/projects/$ID" -H 'Content-Type: application/json' \
  -d '{"title":"Trabajo <!-- FIN NOTAS DEL EQUIPO -->"}'
printf '# Notas del profesor\n\nDocumentación: el bloque empieza con <!-- INICIO NOTAS DEL EQUIPO -->, cita <!-- FIN NOTAS DEL EQUIPO --> y acaba al final.\n' > "$SMOKE_WORKSPACE/projects/$ID/FUENTES.md"
curl -s --max-time 10 -o /dev/null -X PUT "$BASE/api/projects/$ID" -H 'Content-Type: application/json' -d '{"course":"Marcadores 1"}'
curl -s --max-time 10 -o /dev/null -X PUT "$BASE/api/projects/$ID" -H 'Content-Type: application/json' -d '{"course":"Marcadores 2"}'
MARC_COUNT="$(grep -c 'Documentación: el bloque empieza con' "$SMOKE_WORKSPACE/projects/$ID/FUENTES.md" 2>/dev/null || true)"
if [[ "$MARC_COUNT" == "1" ]]; then
  check "los marcadores literales en título y notas no borran ni truncan las notas (×1 tras 2 regeneraciones)" 0
else
  check "los marcadores literales en título y notas no borran ni truncan las notas (aparece ${MARC_COUNT:-0} veces)" 1
fi
if grep -q "y acaba al final" "$SMOKE_WORKSPACE/projects/$ID/FUENTES.md" 2>/dev/null \
  && grep -q "Índice generado automáticamente" "$SMOKE_WORKSPACE/projects/$ID/FUENTES.md" 2>/dev/null; then
  check "la nota con el marcador citado queda completa y con su índice" 0
else
  check "la nota con el marcador citado queda completa y con su índice" 1
fi

echo "== Carrera: subir referencia y editar ficha a la vez =="
printf 'fuente de la batería de humo\n' > "$TMP/fuente.txt"
curl -s --max-time 15 -o "$TMP/up.json" -X POST "$BASE/api/projects/$ID/references" \
  -F "file=@$TMP/fuente.txt" -F "title=Fuente humo" &
UP_PID=$!
curl -s --max-time 15 -o "$TMP/put.json" -X PUT "$BASE/api/projects/$ID" \
  -H 'Content-Type: application/json' -d '{"professor":"Prof. Humo"}' &
PUT_PID=$!
wait "$UP_PID" "$PUT_PID"
REFS="$(curl -s --max-time 10 "$BASE/api/projects/$ID" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(len(d["referenceFiles"]), d["professor"])')"
if [[ "$REFS" == "1 Prof. Humo" ]]; then
  check "la referencia no se pierde al editar la ficha en paralelo (refs/prof: $REFS)" 0
else
  check "la referencia no se pierde al editar la ficha en paralelo (refs/prof: $REFS)" 1
fi

echo "== Borrador y truncación =="
python3 -c 'import json;open("'"$TMP"'/big.json","w").write(json.dumps({"draftText":"palabra "*63000}))'
TRUNC="$(curl -s --max-time 30 -X PUT "$BASE/api/projects/$ID/draft" -H 'Content-Type: application/json' \
  --data-binary @"$TMP/big.json" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("truncated"))' 2>/dev/null)"
if [[ "$TRUNC" == "True" ]]; then check "un borrador >500.000 caracteres se marca truncated=true" 0; else check "un borrador >500.000 caracteres se marca truncated=true" 1; fi

echo "== Exportar Word con sección de referencias =="
DOCX_NAME="$(curl -s --max-time 30 -X POST "$BASE/api/projects/$ID/export" -H 'Content-Type: application/json' \
  -d '{"draftText":"# T\n\nCuerpo.\n\n#### Referencias\n\nAutor, A. (2020). Obra. Editorial.\n","includeSources":true}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin).get("filename",""))' 2>/dev/null)"
if [[ -f "$SMOKE_WORKSPACE/exports/$DOCX_NAME" ]]; then check "el archivo .docx se genera" 0; else check "el archivo .docx se genera" 1; fi
HANGING="$(unzip -p "$SMOKE_WORKSPACE/exports/$DOCX_NAME" word/document.xml 2>/dev/null | grep -c 'w:hanging="720"' || true)"
if [[ -n "$HANGING" && "$HANGING" -ge 1 ]]; then
  check "las referencias llevan sangría francesa APA (w:hanging: $HANGING)" 0
else
  check "las referencias llevan sangría francesa APA (w:hanging: ${HANGING:-0})" 1
fi
DUPLICADO="$(unzip -p "$SMOKE_WORKSPACE/exports/$DOCX_NAME" word/document.xml 2>/dev/null | grep -c 'Referencias registradas' || true)"
if [[ "$DUPLICADO" == "0" ]]; then check "no se duplica la lista preliminar si el borrador ya tiene referencias" 0; else check "no se duplica la lista preliminar si el borrador ya tiene referencias" 1; fi
ESTADO="$(curl -s --max-time 10 "$BASE/api/projects/$ID" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("status",""))' 2>/dev/null)"
if [[ "$ESTADO" == "Exportado a Word" ]]; then check "el estado pasa a 'Exportado a Word' tras exportar" 0; else check "el estado pasa a 'Exportado a Word' tras exportar" 1; fi

echo "== Subir un .docx como referencia y extraer su texto =="
DOCX_REF="$(curl -s --max-time 30 -X POST "$BASE/api/projects/$ID/references" \
  -F "file=@$SMOKE_WORKSPACE/exports/$DOCX_NAME" -F "title=Documento exportado" \
  | python3 -c 'import sys,json;r=json.load(sys.stdin).get("reference",{});print(r.get("extractionStatus","")+"|"+r.get("textFile",""))' 2>/dev/null)"
DOCX_STATUS="${DOCX_REF%%|*}"
DOCX_TEXTFILE="${DOCX_REF##*|}"
if [[ "$DOCX_STATUS" == "Texto extraído" ]]; then
  check "la extracción de texto de un .docx funciona (estado: $DOCX_STATUS)" 0
else
  check "la extracción de texto de un .docx funciona (estado: ${DOCX_STATUS:-sin estado})" 1
fi
if [[ -n "$DOCX_TEXTFILE" ]] && grep -q "Cuerpo" "$SMOKE_WORKSPACE/projects/$ID/referencias_texto/$DOCX_TEXTFILE" 2>/dev/null \
  && grep -q "Autor, A. (2020)" "$SMOKE_WORKSPACE/projects/$ID/referencias_texto/$DOCX_TEXTFILE" 2>/dev/null; then
  check "el texto extraído del .docx contiene el contenido real (no solo un estado)" 0
else
  check "el texto extraído del .docx contiene el contenido real (no solo un estado)" 1
fi

echo "== Protección contra projects.json corrupto (sobre la copia aislada) =="
printf '[{"id": "roto",' > "$PROJECTS_FILE"
CODIGO="$(curl -s --max-time 10 -o "$TMP/corrup.json" -w '%{http_code}' -X PUT "$BASE/api/projects/$ID" \
  -H 'Content-Type: application/json' -d '{"topic":"intento"}')"
if [[ "$CODIGO" == "500" ]]; then check "con el archivo corrupto la escritura responde 500 (no 200)" 0; else check "con el archivo corrupto la escritura responde 500 (no 200)" 1; fi
# La prueba de corrupción deja el archivo aislado ilegible: se reinicia para continuar.
printf '[]\n' > "$PROJECTS_FILE"
ID="$(curl -s --max-time 10 -X POST "$BASE/api/projects" -H 'Content-Type: application/json' \
  -d '{"title":"Proyecto de humo 2","topic":"Tema de prueba"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin).get("id",""))' 2>/dev/null)"
if [[ -n "$ID" ]]; then check "con el archivo aislado restaurado la app vuelve a funcionar" 0; else check "con el archivo aislado restaurado la app vuelve a funcionar" 1; fi

echo "== Exportación APA 6: encabezado corrido (running head) =="
curl -s --max-time 10 -o /dev/null -X PUT "$BASE/api/projects/$ID" -H 'Content-Type: application/json' -d '{"apaVersion":"6"}'
DOCX6="$(curl -s --max-time 30 -X POST "$BASE/api/projects/$ID/export" -H 'Content-Type: application/json' \
  -d '{"draftText":"# T6\n\nCuerpo de la prueba APA 6.\n","includeSources":true}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin).get("filename",""))' 2>/dev/null)"
TITLEPG="$(unzip -p "$SMOKE_WORKSPACE/exports/$DOCX6" word/document.xml 2>/dev/null | grep -c '<w:titlePg/>' || true)"
if [[ -n "$TITLEPG" && "$TITLEPG" -ge 1 ]]; then
  check "APA 6 activa la primera página distinta en el Word (w:titlePg)" 0
else
  check "APA 6 activa la primera página distinta en el Word (w:titlePg: ${TITLEPG:-0})" 1
fi
RUNNING=""
for H in $(unzip -l "$SMOKE_WORKSPACE/exports/$DOCX6" 2>/dev/null | grep -o 'word/header[0-9]*\.xml'); do
  RUNNING="${RUNNING}$(unzip -p "$SMOKE_WORKSPACE/exports/$DOCX6" "$H" 2>/dev/null)"
done
if [[ "$RUNNING" == *"Running head:"* && "$RUNNING" == *"PROYECTO DE HUMO 2"* ]]; then
  check "APA 6 escribe 'Running head:' con el título corto en los encabezados" 0
else
  check "APA 6 escribe 'Running head:' con el título corto en los encabezados" 1
fi

echo "== Eliminar proyecto =="
BORRADO="$(curl -s --max-time 15 -X DELETE "$BASE/api/projects/$ID" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("ok"))' 2>/dev/null)"
if [[ "$BORRADO" == "True" ]]; then check "DELETE del proyecto responde ok" 0; else check "DELETE del proyecto responde ok" 1; fi
if [[ ! -d "$SMOKE_WORKSPACE/projects/$ID" ]]; then check "la carpeta del proyecto desaparece" 0; else check "la carpeta del proyecto desaparece" 1; fi
REPETIDO="$(curl -s --max-time 10 -o /dev/null -w '%{http_code}' -X DELETE "$BASE/api/projects/$ID")"
if [[ "$REPETIDO" == "404" ]]; then check "un DELETE repetido responde 404" 0; else check "un DELETE repetido responde 404" 1; fi

echo
echo "Resultado: $PASS PASS / $FAIL FAIL"
if [[ "$FAIL" -ne 0 ]]; then exit 1; fi
