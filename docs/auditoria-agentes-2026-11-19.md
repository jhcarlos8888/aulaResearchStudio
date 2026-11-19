# Auditoría de inferencia de los seis agentes académicos — 19 de noviembre de 2026

## Alcance

Se comprobó una inferencia real y breve de cada agente académico, con tareas sintéticas que pedían no usar herramientas ni escribir archivos. La identidad del agente y el modelo efectivo fueron observados en el encabezado nativo del CLI. Los códigos de salida se obtuvieron del shell, no del texto generado por el modelo.

**Separación de evidencias:** las respuestas del coordinador y el revisor APA fueron obtenidas durante la ronda 7 de la fábrica; los otros cuatro agentes se comprobaron después de manera independiente mediante terminal seudointeractiva (PTY). Esto no modifica el resultado histórico failed de la ronda 7, cuyo Implementer no concluyó.

| Agente | Modelo efectivo | Exit code | Duración | Recibo |
|---|---|---:|---:|---|
| coordinador-investigacion | GLM-5.3-Flash | 0 | 25,4 s | SQLite de la fábrica, ronda 7, evento 13758 |
| revisor-apa | DeepSeek-V4.1-Flash | 0 | 55,0 s | SQLite de la fábrica, ronda 7, evento 13770; skill apa cargada |
| investigador-fuentes | GLM-5.3-Flash | 0 | 4 s | PTY; aula-postdeploy-agent-pty.stdout |
| redactor-academico | GLM-5.3-Flash | 0 | 3 s | PTY; aula-r7-live-redactor-academico-pty.out |
| auditor-fuentes | DeepSeek-V4.1-Flash | 0 | 19 s | PTY; aula-r7-live-auditor-fuentes-pty.out |
| editor-critico | DeepSeek-V4.1-Flash | 0 | 20 s | PTY; aula-r7-live-editor-critico-pty.out |

## Ejecución y reproducibilidad

El CLI de OpenCode 2.1.4 no devolvió texto en varios intentos realizados desde una shell remota sin PTY, que finalizaron por timeout. Ejecutando los mismos agentes mediante la herramienta Linux script, que les proporciona una terminal seudointeractiva, las cuatro inferencias pendientes respondieron y terminaron con exit code 0. Esto apunta a una diferencia del entorno de ejecución; los timeouts headless no demostraban un fallo de los modelos.

Invocación de ejemplo desde la raíz de Aula Research Studio (Linux):

~~~bash
cd /ruta/a/aulaResearchStudio
timeout 100 script -q -e -c "$HOME/.opencode/bin/opencode run --agent investigador-fuentes 'Explica dos criterios para evaluar una fuente, sin usar herramientas ni modificar archivos.'" /dev/null
~~~

La opción -e propaga el código de salida del comando hijo. Cada prueba consume inferencia del modelo seleccionado. No debe incluirse sin consentimiento explícito en el smoke test ordinario.

## Extractos y huellas de los resultados

En la ronda 7, el coordinador respondió sobre planificación de un artículo y el revisor APA corrigió el apellido García y explicó cuándo debe mantenerse el localizador de página. Ambos recibos incluyen cabecera agente/modelo y exit code 0.

**investigador-fuentes (GLM-5.3-Flash):** Antes de citar una fuente sobre reciclaje comunitario conviene verificar su autoría y autoridad (si es un estudio revisado por pares, un informe oficial o una opinión), su fecha de publicación y la metodología con la que sustenta sus datos, además de posibles conflictos de interés. También es necesario abrir la página o el documento original para confirmar que título, autores, año y cifras coinciden con lo que dice el fragmento del buscador, y registrar la fecha de consulta si el contenido es dinámico.

SHA-256 del stdout original: 06517636803fdd9b9cf34d0803492245f990f036a50b65e9c500c38cba721541.

**redactor-academico (GLM-5.3-Flash):** El reciclaje comunitario se ha consolidado como una de las estrategias más accesibles para que las comunidades locales participen directamente en el manejo responsable de sus residuos. Al involucrar a vecinos, organizaciones y autoridades en acciones coordinadas de separación y aprovechamiento de materiales, estas iniciativas no solo contribuyen a la reducción del volumen de desechos que llega a los rellenos sanitarios, sino que también fortalecen los lazos sociales y fomentan una cultura ambiental compartida.

SHA-256 del stdout original: 3a5d43df77c7df09902c0ea6b3be71543eb3ab3f6a4df107bc49c783729f2040.

**auditor-fuentes (DeepSeek-V4.1-Flash):** **Afirmación de prueba:** «el 70 por ciento de los hogares recicla». 1. No es verificable porque no delimita población, ámbito geográfico, periodo, tamaño ni diseño de muestra, y tampoco define operacionalmente «reciclar» —separar en casa, entregar a recolección diferenciada o reciclar al menos un material producen porcentajes distintos—, de modo que el 70 % no puede contrastarse con ningún dato concreto. 2. Exigiría una fuente primaria —encuesta con muestreo probabilístico documentado o estadística oficial del organismo competente— que declare universo, fecha de trabajo de campo, tamaño de muestra, margen de error, el enunciado exacto de la pregunta del cuestionario y el criterio aplicado p

SHA-256 del stdout original: 8572e7a367c7d11c02aff9cfdf179aed70a9d143964086c6e8ce69a26427b38c.

**editor-critico (DeepSeek-V4.1-Flash):** ✓ Prueba mínima editor-critico Editor-Critico Agent **Prueba mínima: superada.** El subagente `editor-critico` respondió sin usar herramientas (no hay llamadas a archivos, shell ni web en su ejecución), y el contenido se sostiene solo con razonamiento. Resultado devuelto: **Dos problemas argumentativos** 1. **Universalidad no sostenida.** «Siempre» y «toda» son cuantificadores universales: basta un caso documentado en que el reciclaje no elimine íntegramente la contaminación —pérdidas en recolección, rechazo de material contaminado, efluentes del propio procesamiento— para refutar la tesis. El enunciado no admite gradación, así que exigiría una imposibilidad lógica o empírica, no ejemplos fa

SHA-256 del stdout original: 68b3491cc238dfad2ccd5e83421537e410ab1a8e64d44fa7acb01555bdd711eb.

## Lo que estas pruebas NO demuestran

- No se hizo aún un encargo académico integral de investigación con fuentes reales, comunicación entre seis roles y generación final revisada.
- La ronda 7 acreditó estructuralmente un DOCX con imagen idéntica byte a byte, pero quedó pendiente su renderización visual: no había LibreOffice, soffice, Pandoc ni AbiWord en la máquina.
- El Playwright MCP configurado en opencode.json contiene una ruta local de Chromium y usa @latest; esa dependencia necesita trabajo de portabilidad y fijación de versión antes de replicar el entorno en otras máquinas.
- Tras las correcciones de la fábrica, todavía conviene una ronda corta específica para comprobar en vivo la transferencia de handoffs de fases fallidas y el PATH de OpenCode; las pruebas automatizadas de código sí pasaron.
