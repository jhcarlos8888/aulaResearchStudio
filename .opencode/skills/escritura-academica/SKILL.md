---
name: escritura-academica
description: Redacta documentos académicos con estructura, argumentación, claridad y vínculo visible entre evidencia e interpretación.
compatibility: OpenCode
---
# Skill: escritura académica

## Arquitectura
Adapta la estructura al tipo de trabajo y a la rúbrica. En un trabajo argumentativo suele funcionar: introducción (problema, contexto, relevancia, objetivo y tesis), desarrollo organizado por argumentos o temas, discusión de límites/contraargumentos, conclusión y referencias. En informes empíricos, incluye métodos, resultados y discusión solo en la medida que los datos realmente existan.

## Párrafos
Construye cada párrafo alrededor de una idea central. Integra evidencia pertinente, explica cómo sustenta la idea, compara o matiza cuando haga falta y conecta con el hilo del trabajo. No conviertas la revisión de literatura en una sucesión de resúmenes de una fuente por párrafo.

## Redacción
- Usa términos precisos, define conceptos especializados y mantén consistencia terminológica.
- Evita relleno, expresiones grandilocuentes, frases comodín, repeticiones y afirmaciones vagas como "está comprobado" sin evidencia.
- Distingue la voz del autor de las ideas ajenas; cita paráfrasis además de las citas textuales.
- Expresa incertidumbre proporcional a la evidencia y evita conclusiones más fuertes que los datos.
- Conserva un tono y nivel adecuados al público y al tipo de encargo.

## Imágenes y figuras
- Escribe el pie **después de haber mirado la imagen**, y que el pie diga solo lo que se ve en ella. No describas la pantalla que supones que muestra.
- Cada figura lleva pie con: número, título descriptivo, fuente con URL y fecha de consulta. Si la figura no es del autor, dilo en el pie y en la nota metodológica.
- Si la fuente oficial **no tiene** imágenes de lo que hay que ilustrar, declara la limitación en vez de buscar por las ramas. Eso es un hallazgo, no un fallo.

## Salida a Word
- El borrador puede estar bien y el DOCX salir mal. **Verifica el binario final**, no solo el Markdown: descomprime el `.docx`, cuenta `word/media/`, comprueba `drawing` y relaciones en `document.xml`, y comprueba que ningún texto diga «imagen no disponible».
- **Una sola reescalada.** Si capturas una página web, descarga el archivo original a su resolución completa en vez de capturar el elemento ya reescalado por el navegador: doble remuestreo (navegador + Word) produce aliasing que se lee como líneas blancas horizontales en el borde de los diálogos.
- Comprueba que el `extent` respeta la proporción original (por ejemplo, 1024×768 → 600×450). Una deformación de más del 2 % en el ratio es un defecto visible.

## Extensión
- Si el límite del docente choca con el pedido del estudiante, registra la excepción y pregunta al docente **una vez**. No vuelvas a insistir en la misma limitación.
