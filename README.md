# Aula Research Studio

Aplicación local en español para planificar trabajos escritos, organizar referencias, preparar tareas para OpenCode, coordinar agentes especializados, revisar borradores y exportar a Microsoft Word (`.docx`). Está diseñada como apoyo a la docencia y a la investigación responsable.

## Qué incluye

- **Panel visual** para crear y organizar proyectos separados por trabajo.
- **Ficha del encargo**: tema, pregunta de investigación, objetivos, metodología, tipo de trabajo, extensión, institución, materia, docente, estudiante, fecha y requisitos de evaluación.
- **Estilo de citación configurable**: APA 7.ª, APA 6.ª u otros estilos como requisito inicial. La guía institucional adjunta debe consultarse cuando exista.
- **Biblioteca de referencias por proyecto**: carga PDF, DOCX, TXT, Markdown, CSV o HTML; guarda el original, registra metadatos y extrae texto de formatos compatibles para que los agentes puedan consultarlo. Un PDF escaneado puede requerir OCR.
- **Paquete OpenCode**: crea `BRIEF.md`, `FUENTES.md`, `PROMPT_OPENCODE.md`, `PLAN_INVESTIGACION.md` y una bitácora en la carpeta del proyecto.
- **Seis agentes**: coordinación, investigación de fuentes, redacción académica, auditoría de referencias, revisión de APA y edición crítica.
- **Siete skills reutilizables** para planificación, investigación, escritura, APA, gestión de referencias, revisión crítica e integridad académica.
- **Borrador editable**: guarda texto, importa un `BORRADOR.md` generado por OpenCode y prepara instrucciones de corrección sucesivas.
- **Exportación Word** con portada que utiliza los datos institucionales, Times New Roman 12, interlineado doble y márgenes de 2,54 cm como base. Incrusta las figuras citadas en el borrador (`![](imagenes/figura.png)`), escaladas sin deformar y nunca por encima de su resolución original. Se pueden adjuntar al final entradas preliminares construidas con los metadatos de las fuentes cargadas.
- **Configuración de Playwright MCP** para que OpenCode pueda operar un navegador al investigar en sitios web.

## Requisitos

- Linux, macOS o Windows con WSL.
- Node.js 20 o superior y npm.
- OpenCode instalado y configurado con un proveedor/modelo de IA.
- Conexión a Internet cuando se usen búsquedas web o se descargue el servidor MCP.

La app no contiene un modelo de IA ni hace llamadas directas a una API de modelos. La interfaz administra el proyecto; OpenCode y el proveedor que tengas configurado realizan el trabajo con los agentes. No hace falta una clave de API para abrir la aplicación local, pero sí se necesita que OpenCode funcione para ejecutar los agentes.

## Instalación rápida en Ubuntu / Debian

1. Descomprime la carpeta `aula-research-studio`.
2. Abre una terminal dentro de esa carpeta.
3. Ejecuta:

```bash
chmod +x scripts/*.sh
./scripts/setup.sh
./scripts/start.sh
```

4. Abre en el navegador: <http://127.0.0.1:4173>.
5. Crea un proyecto, carga las fuentes y completa el encargo.

También puedes hacerlo sin scripts:

```bash
npm install
npm start
```

La aplicación usa el puerto `4173` por defecto. Para cambiarlo, copia `.env.example` a `.env` y define `PORT` (y opcionalmente `HOST`), o exporta las variables en la terminal antes de arrancar: `PORT=5000 ./scripts/start.sh`.

Para detener la aplicación, pulsa `Ctrl+C` en la terminal. Los proyectos no desaparecen al cerrar el servidor.

## Flujo recomendado con OpenCode

1. Crea un proyecto en Aula Research Studio y guarda las instrucciones/rúbrica en la ficha.
2. En **Fuentes y documentos**, carga las referencias, el formato institucional y las lecturas disponibles. Comprueba el estado de extracción y completa autor/año/URL cuando los hayas verificado.
3. En **OpenCode y agentes**, prepara los archivos del proyecto. La ruta aparece en pantalla y normalmente será `workspace/projects/<ID>`.
4. Desde la raíz de esta aplicación, ejecuta `opencode` para que reconozca `opencode.json`, `.opencode/agents/` y `.opencode/skills/`.
5. Pídele al coordinador que lea `.opencode/INSTRUCCIONES_GENERALES.md`, `workspace/projects/<ID>/PROMPT_OPENCODE.md` y `BRIEF.md`. El flujo está diseñado para generar primero el plan y la matriz de fuentes; luego el borrador; después las auditorías.
6. Los productos de los agentes deben guardarse en `workspace/projects/<ID>/`. El archivo esperado para importar al editor es `BORRADOR.md`.
7. En **Borrador y exportación**, pulsa **Importar de OpenCode**, revisa y edita el contenido, y guarda. Añade instrucciones en el apartado de correcciones para preparar `SOLICITUD_REVISION.md`; luego pídele a OpenCode que la ejecute.
8. Exporta a Word cuando esté listo. Vuelve a verificar citas, referencias, tablas, figuras, títulos, paginación, portada y la guía de la institución.

Prompt inicial sugerido:

```text
Lee .opencode/INSTRUCCIONES_GENERALES.md, workspace/projects/<ID>/PROMPT_OPENCODE.md y BRIEF.md. Usa el agente coordinador-investigacion y los agentes especializados. Empieza por el plan y la matriz de fuentes. No inventes datos bibliográficos, citas ni resultados, ni afirmes que una fuente fue verificada si no pudiste abrirla; marca lo no verificable como pendiente. Guarda todos los productos (BORRADOR.md, INFORME_REVISION.md y PENDIENTES_DE_VERIFICACION.md) dentro de la carpeta del proyecto para que la app pueda importarlos.
```

## Playwright MCP

El proyecto incluye la configuración local de Playwright MCP en `opencode.json` (forma V2, `mcp.servers`):

```json
{
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": [
          "npx", "-y", "@playwright/mcp@latest",
          "--executable-path", "/ruta/a/tu/chromium/chrome-linux64/chrome",
          "--headless", "--no-sandbox"
        ],
        "timeout": { "startup": 30000, "catalog": 30000 }
      }
    }
  }
}
```

**Sobre `--executable-path`:** `@playwright/mcp` necesita un Chrome/Chromium concreto. Puedes usar el de Playwright en tu espacio de usuario (`npx playwright install chromium`, que lo instala en `~/.cache/ms-playwright/chromium-<versión>/`) o el Chrome del sistema (`/opt/google/chrome/chrome`, instalado con el `.deb` de Google). Ten en cuenta dos cosas: **(1)** la ruta incluye la versión (`chromium-1248`…), así que tras volver a ejecutar `npx playwright install chromium` hay que actualizarla; **(2)** al ser una ruta absoluta, en otra máquina hay que ajustarla (o apuntar al Chrome del sistema). Sin una ruta válida, el MCP fallará al arrancar con «Missing Chrome».

La primera vez, OpenCode puede descargar el servidor MCP y el navegador. En OpenCode, comprueba el estado de los servidores MCP mediante `/mcps` (según la versión instalada) y confirma que Playwright esté conectado antes de la búsqueda. La automatización del navegador depende de la compatibilidad de los sitios y sus medidas de acceso; no evita suscripciones ni restricciones.

## MCP adicionales opcionales

Playwright ya viene configurado. Para búsquedas estructuradas con una API puedes añadir Brave Search MCP (requiere clave) y, en investigaciones técnicas, Context7. La integración con Zotero depende del servidor MCP comunitario que elijas. Las instrucciones y una configuración de ejemplo están en [`docs/MCP_OPCIONALES.md`](docs/MCP_OPCIONALES.md); ninguno de los servicios opcionales es obligatorio para abrir la aplicación.

## Dónde se guardan los datos

- `data/projects.json`: metadatos, referencias registradas y borradores guardados en la app.
- `workspace/projects/<ID>/referencias/`: archivos originales aportados.
- `workspace/projects/<ID>/referencias_texto/`: texto extraído automáticamente para lectura por agentes.
- `workspace/projects/<ID>/`: brief, instrucciones, plan, matriz, borrador e informes.
- `workspace/exports/`: archivos Word generados.

Haz copias de seguridad de la carpeta completa. No edites `data/projects.json` mientras el servidor esté ejecutándose. Si el archivo se corrompe, la aplicación se niega a modificarlo y responde con un error en lugar de sobrescribirlo; restaura la copia de seguridad más reciente.

Para eliminar un trabajo por completo (registro, referencias, borrador y exportaciones), abre el proyecto y pulsa **Eliminar trabajo** en la vista «Resumen y encargo». Esta acción no se puede deshacer.

## Privacidad y seguridad

- De forma predeterminada, la app escucha solo en `127.0.0.1`; no está pensada para publicarla en Internet ni en una red pública.
- No tiene login multiusuario. Cualquier persona que use la misma cuenta del sistema puede acceder a los datos locales.
- La app no envía los documentos a un proveedor de IA por sí sola. Cuando se los pides a OpenCode y el modelo/proveedor requiere servicio remoto, el contenido necesario puede procesarse fuera de tu equipo. No compartas datos sensibles sin autorización.
- Los documentos web y cargados se tratan como datos no confiables. Las instrucciones de los agentes piden ignorar texto malicioso incrustado en fuentes.
- No hay verificación bibliográfica automática infalible. Los metadatos de un archivo pueden ser incompletos y las entradas preliminares de bibliografía están marcadas para su revisión.
- Las dependencias pasan `npm audit` con **0 vulnerabilidades**. La extracción de texto de `.docx` se hace con un módulo propio (`lib/docx-text.js`, ZIP + XML con `node:zlib`) sin dependencias externas; `.pdf` usa `pdf-parse`.

## Notas sobre `FUENTES.md`

`FUENTES.md` se regenera automáticamente cada vez que cambia el proyecto (referencias o ficha). Para no perder trabajo manual:

- **Escribe dentro del bloque de notas**, entre las líneas `<!-- INICIO NOTAS DEL EQUIPO -->` y `<!-- FIN NOTAS DEL EQUIPO -->` (cada una en su propia línea). Todo lo que añadas a partir de la línea INICIO se conserva en cada regeneración, incluido el texto que dejes después del FIN (se reincorpora al bloque).
- Si editas el archivo entero a mano y **no** conservas la primera línea de índice automática, se trata como archivo manual y se conserva íntegro dentro del bloque de notas.
- El índice de referencias de arriba sí se sobrescribe siempre: es un reflejo automático de los archivos subidos.

## Alcance de APA y de la exportación Word

El exportador aplica una base de formato útil para borradores, con portada y estilos de párrafo sencillos. La aplicación no pretende certificar automáticamente que un documento cumple todas las reglas de APA 6.ª o 7.ª. Algunas decisiones dependen del tipo de trabajo, de la guía institucional y del contenido (tablas, figuras, encabezados, referencias, notas, apéndices y paginación). Inspecciona el Word exportado antes de entregarlo. La sección de fuentes que se puede adjuntar es una lista preliminar construida a partir de los datos que ingresaste, no una bibliografía validada.

Diferencias reales que sí aplica la exportación según la edición elegida:

- **APA 6.ª**: encabezado corrido (*running head*) con el título corto en mayúsculas y el número de página en todas las páginas, y en la portada el prefijo `Running head:`; sangría francesa en las referencias.
- **APA 7.ª**: solo el número de página en el encabezado (sin *running head* en trabajos de estudiante); sangría francesa en las referencias.

El resto de diferencias entre ediciones (nivel de encabezados 4-5, tipo de trabajo, tablas y figuras, notas) no se automatiza: revísalo según tu guía institucional.

## Comprobación local

```bash
npm run check   # sintaxis de JavaScript
npm run smoke   # batería de humo: arranca el servidor y prueba el flujo real
```

La batería de humo (`scripts/smoke-test.sh`) arranca un servidor temporal en el puerto 4399 con **un directorio de datos propio y aislado**: crea un proyecto de prueba, comprueba las plantillas iniciales y la conservación de `FUENTES.md`, sube referencias en paralelo, guarda un borrador gigante, exporta a Word (sangría francesa y encabezados APA), comprueba la **exportación de figuras** (una imagen válida incrustada una sola vez y sin deformar; un formato no admitido, un fichero corrupto y uno inexistente quedan como aviso visible sin tumbar la exportación), sube un `.docx` y extrae su texto, comprueba la protección contra `data/projects.json` corrupto y elimina el proyecto. **No toca tus proyectos reales** (aunque la aplicación esté abierta) y borra sus datos al terminar. Requiere `node`, `python3`, `unzip` y `curl`. `npm run check` solo revisa sintaxis; no sustituye la revisión manual del Word ni de la guía institucional.

## Referencias oficiales de la integración

- OpenCode — agentes: <https://opencode.ai/v2/docs/agents>
- OpenCode — skills: <https://opencode.ai/v2/docs/skills>
- OpenCode — servidores MCP: <https://opencode.ai/v2/docs/mcp-servers>
- Microsoft Playwright MCP: <https://github.com/microsoft/playwright-mcp>
- Generación de Word con `docx`: <https://www.npmjs.com/package/docx>
