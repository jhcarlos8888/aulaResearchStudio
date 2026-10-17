# MCP adicionales (opcionales)

El programa ya incluye Playwright MCP para navegar e interactuar con páginas web. Puedes ampliar la investigación con servidores extra, pero no conviene activar demasiados MCP a la vez porque sus herramientas consumen contexto y cada integración puede tener permisos, límites o requisitos propios.

## 1. Brave Search MCP — búsquedas web estructuradas

El servidor oficial mantenido por Brave es `@brave/brave-search-mcp-server`. Requiere una clave de Brave Search API y sus cuotas/condiciones dependen de la cuenta de Brave. Consulta primero la documentación y el acceso vigentes en <https://github.com/brave/brave-search-mcp-server>.

Añade este bloque al objeto `mcp` de `opencode.json` si ya tienes la clave:

```json
"brave-search": {
  "type": "local",
  "command": ["npx", "-y", "@brave/brave-search-mcp-server"],
  "enabled": true,
  "timeout": 30000
}
```

No escribas la clave dentro de un archivo que vayas a compartir. Exporta la variable `BRAVE_API_KEY` en la terminal antes de iniciar OpenCode, por ejemplo en Linux/macOS:

```bash
export BRAVE_API_KEY='TU_CLAVE_REAL'
opencode
```

La aplicación no necesita esta clave. Si no tienes una, usa Playwright MCP con páginas públicas y deja este servidor sin configurar. Una búsqueda estructurada sigue necesitando abrir la fuente original para verificar los metadatos y las afirmaciones.

## 2. Context7 — documentación técnica

Puede ser útil cuando el trabajo trate sobre software, bibliotecas, herramientas o documentación técnica. Añádelo con la instrucción oficial de OpenCode y valida la configuración en tu versión:

```bash
opencode mcp add context7 --url https://mcp.context7.com/mcp
```

Guía oficial de MCP en OpenCode: <https://docs.opencode.ai/docs/mcp-servers/>.

## 3. Zotero — biblioteca académica

Si ya usas Zotero, puede servir como gestor bibliográfico independiente para ordenar PDFs, corregir metadatos y conservar colecciones. Hay varios servidores MCP comunitarios con permisos y requisitos diferentes; este proyecto no activa ninguno por defecto. Antes de habilitar uno, revisa su mantenimiento, licencia, permisos de lectura/escritura, manejo de claves y si opera contra Zotero local o la API en la nube. Conserva Zotero como fuente de verdad para metadatos bibliográficos y vuelve a comprobar las referencias en el documento original.

## Comprobación

Tras editar `opencode.json`, reinicia OpenCode o vuelve a cargar los MCP usando el mecanismo de tu versión, y comprueba que el servidor figure conectado. Si falla, revisa Node.js/npx, conectividad, variables de entorno, cuota y los mensajes de OpenCode. No incluyas claves en capturas, prompts ni entregables.
