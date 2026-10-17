# Matriz de fuentes

Investigación: ISO de evaluación de Windows Server 2016 (Evaluation Center de Microsoft): tamaño y ediciones incluidas.
Fecha de consulta de todas las fuentes: **2026-10-17**.
Nota: no existían `FUENTES.md`, `referencias/` ni `referencias_texto/` en el repositorio al inicio de esta consulta.

---

## F1 — Página de descarga del Evaluation Center (es-ES)

- **Referencia verificada**: Microsoft. *Windows Server 2016 | Centro de evaluación de Microsoft* (página de descarga).
- **Tipo**: Página oficial de producto/descarga de Microsoft (fuente primaria del fabricante).
- **URL final verificada**: https://www.microsoft.com/es-es/evalcenter/download-windows-server-2016 (abierta con Playwright; respondedora; título: "Windows Server 2016 | Centro de evaluación de Microsoft").
- **Autor/entidad**: Microsoft Corporation.
- **Fecha de publicación**: desconocida (página dinámica, sin fecha visible).
- **Fecha de consulta**: 2026-10-17.
- **Pregunta que ayuda a responder**: ¿Qué opciones de edición/tipo de descarga ofrece el Evaluation Center para Windows Server 2016?
- **Afirmaciones concretas respaldadas**:
  - La página presenta una tabla "Descarga de Windows Server 2016" organizada **por idioma** (Inglés (Estados Unidos), Chino (simplificado), Francés, Alemán, Italiano, Japonés, Ruso y **Español**), con un único enlace "Descargas ISO → Descargar Windows Server 2016 ISO de 64 bits" por idioma (etiqueta del enlace: "Edición de 64 bits").
  - **No existe selector de edición Standard/Datacenter** en la página de descarga: es un ISO único por idioma. Tampoco aparece tamaño de archivo ni checksum (SHA256/MD5) en la página.
  - En la fila de Inglés (EE. UU.) se añade un enlace "Prueba Windows Server en Azure" (no así en el resto de filas).
  - Texto oficial de la página: "Las ediciones de evaluación de Windows Server 2016 expiran en 180 días"; se recomienda instalar el paquete de servicio más reciente tras la instalación.
- **Metodología/base**: inspección del árbol de accesibilidad completo de la página cargada en navegador real (Playwright).
- **Limitaciones**: página dinámica sujeta a cambio por Microsoft; no aporta tamaño ni hash.
- **Conflictos de interés**: página promocional del propio fabricante (no independiente), pero los datos de estructura de descarga son fiables como descripción del mecanismo de distribución.
- **Estado**: **verificada** (página abierta y leída íntegramente).

## F2 — Página "evaluar" del Evaluation Center (es-ES) sobre ediciones incluidas

- **Referencia verificada**: Microsoft. *Windows Server 2016 | Centro de evaluación* (página descriptiva "evaluate").
- **Tipo**: Página oficial de producto de Microsoft (fuente primaria del fabricante).
- **URL final verificada**: https://www.microsoft.com/es-es/evalcenter/evaluate-windows-server-2016 (abierta con Playwright; respondedora; título: "Windows Server 2016 | Centro de evaluación").
- **Autor/entidad**: Microsoft Corporation.
- **Fecha de publicación**: desconocida (página dinámica, sin fecha visible).
- **Fecha de consulta**: 2026-10-17.
- **Pregunta que ayuda a responder**: ¿El ISO de evaluación incluye Standard, Datacenter o ambas?
- **Afirmación concreta respaldada (cita textual de la página, sección "Elige una edición y una opción de instalación:")**:
  > "Los clientes que se descarguen el archivo ISO completo deberán elegir una edición y una opción de instalación. Esta evaluación de archivo ISO es para las ediciones Datacenter y Standard."
  (La misma página describe a continuación las características de la edición Datacenter.)
- **Metodología/base**: búsqueda de texto en la página cargada en navegador real (Playwright).
- **Limitaciones**: es texto descriptivo del fabricante; no se verificó internamente el contenido del ISO (no se descargó el archivo completo).
- **Conflictos de interés**: página promocional del fabricante.
- **Estado**: **verificada** (cita leída en la página original).

## F3 — Cabeceras HTTP del archivo ISO es-ES servido por Microsoft (tamaño)

- **Referencia verificada**: Archivo alojado en los servidores de descarga de Microsoft, enlace obtenido desde F1.
- **Tipo**: dato primario del propio servidor de distribución de Microsoft (cabeceras HTTP HEAD).
- **URL del enlace de descarga (fwlink)**: https://go.microsoft.com/fwlink/p/?LinkID=2195174&clcid=0x40a&culture=es-es&country=ES
- **URL final tras redirección 301**: https://download.microsoft.com/download/7/6/9/769D6905-3BC7-4CF0-B3BD-785EC88767AF/14393.0.161119-1705.RS1_REFRESH_SERVER_EVAL_X64FRE_ES-ES.ISO
- **Autor/entidad**: Microsoft Corporation (host: download.microsoft.com).
- **Fecha de consulta**: 2026-10-17 (solo se ejecutó una petición HEAD; el archivo NO se descargó).
- **Pregunta que ayuda a responder**: ¿Cuál es el tamaño exacto del ISO de evaluación es-ES?
- **Datos concretos obtenidos (cabeceras del servidor)**:
  - `Content-Length: 6996785152` bytes = **6,516 GiB** (≈ 6.672,7 MiB) ≈ **7,00 GB** (decimal).
  - `Content-Disposition`: nombre de archivo `14393.0.161119-1705.RS1_REFRESH_SERVER_EVAL_X64FRE_ES-ES.ISO`.
  - `Last-Modified: Wed, 29 Jan 2025 11:08:29 GMT`.
  - `ETag: "0x37FCB179559C6F7C3CE170D932F04B8F9E2079D7B9BB180A122EC697ACD63A55"` (ETag interno del servidor; **no** es un hash público verificable documentado, no usar como checksum).
  - **No se devuelve ningún checksum (SHA256/MD5) en las cabeceras**.
- **Metodología/base**: `curl -sIL` (HEAD) sobre el fwlink oficial; se registró la cadena de redirección y las cabeceras finales.
- **Limitaciones**: el tamaño refleja el archivo servido en la URL el 2026-10-17; Microsoft podría sustituir el archivo en el futuro. El nombre indica compilación 14393 (RS1) con sello 161119-1705 ("RS1_REFRESH").
- **Conflictos de interés**: ninguno (dato técnico del servidor del fabricante).
- **Estado**: **verificado** (cabeceras recibidas del servidor de Microsoft).

## F4 — Cabeceras HTTP del archivo ISO en-US servido por Microsoft (tamaño, referencia)

- **Referencia verificada**: archivo alojado en los servidores de Microsoft, enlace obtenido desde F1 (fila "Inglés (Estados Unidos)").
- **Tipo**: dato primario del servidor de distribución de Microsoft (cabeceras HTTP HEAD).
- **URL del enlace de descarga (fwlink)**: https://go.microsoft.com/fwlink/p/?LinkID=2195174&clcid=0x409&culture=en-us&country=US
- **URL final tras redirección 301**: https://software-static.download.prss.microsoft.com/pr/download/Windows_Server_2016_Datacenter_EVAL_en-us_14393_refresh.ISO
- **Autor/entidad**: Microsoft Corporation (host: software-static.download.prss.microsoft.com).
- **Fecha de consulta**: 2026-10-17 (solo petición HEAD; el archivo NO se descargó).
- **Pregunta que ayuda a responder**: ¿Cuál es el tamaño del ISO en-US y qué nombre de archivo usa?
- **Datos concretos obtenidos**:
  - `Content-Length: 6972221440` bytes = **6,493 GiB** (≈ 6.649,2 MiB) ≈ **6,97 GB** (decimal).
  - `Content-Disposition`: nombre de archivo `Windows_Server_2016_Datacenter_EVAL_en-us_14393_refresh.ISO`.
  - `Last-Modified: Tue, 15 May 2018 18:46:29 GMT`.
  - `ETag: "0x1BF289B41569AADEBAC45B9FDDA8C1890983D602B78B88F140A2A7AB2EDFC2AE"` (no documentado como hash público).
  - **No se devuelve ningún checksum en las cabeceras**.
- **Metodología/base**: `curl -sIL` (HEAD) sobre el fwlink oficial.
- **Limitaciones**: el nombre del archivo en-US contiene "Datacenter_EVAL", pero según F2 el ISO de evaluación sirve para ambas ediciones (la edición se elige en la instalación); no se descargó el ISO para inspeccionar las imágenes WIM contenidas. Tamaño sujeto a cambio.
- **Conflictos de interés**: ninguno.
- **Estado**: **verificado** (cabeceras recibidas del servidor de Microsoft).

---

## Fuentes descartadas o no verificadas

- **Cifras de tamaño difundidas en blogs y foros** (~6,4–6,6 GiB): coinciden aproximadamente con F3/F4, pero **no se citan como respaldo**; el respaldo oficial y verificado es F3/F4. No se usaron blogs como fuente.
- **Microsoft Learn / Q&A de Microsoft**: se localizaron resultados (p. ej. preguntas de la comunidad de Microsoft Q&A que afirman que durante la instalación se puede elegir Standard o Datacenter), pero son **contenido de comunidad, no documentación oficial**; la afirmación oficial correspondiente es F2. No se encontró ninguna página oficial de Microsoft Learn que publique el tamaño del ISO ni su checksum.
- **Checksum (SHA256/MD5) del ISO**: **no pudo verificarse** que Microsoft publique uno para estos ISO de evaluación; ni la página de descarga (F1), ni la página de evaluación (F2), ni las cabeceras del servidor (F3/F4) muestran hash alguno.
