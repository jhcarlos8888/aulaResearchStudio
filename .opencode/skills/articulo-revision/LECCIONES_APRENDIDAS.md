# Lecciones Aprendidas — Artículos de Revisión Académicos

> Documento de referencia para futuros trabajos de artículo de revisión.
> Última actualización: 2026-11-02

## 1. Flujo de trabajo óptimo

### Fase 1: Planificación (30 min)
1. Leer `BRIEF.md` y `PROMPT_OPENCODE.md`
2. Revisar plantilla y transcripción de clase (si existen)
3. Crear `PLAN_INVESTIGACION.md` con:
   - Pregunta delimitada
   - Objetivo general (sin específicos para artículos de revisión)
   - Estructura tentativa
   - Criterios de inclusión/exclusión
   - Estrategia de búsqueda

### Fase 2: Investigación de fuentes (1-2 horas)
1. Crear `MATRIZ_FUENTES.md` inicial con fuentes aportadas
2. Usar `investigador-fuentes` o `general` para buscar fuentes web
3. Verificar cada fuente abriendo la página original
4. Registrar: autor, año, título, revista, DOI/URL, afirmaciones, limitaciones
5. Excluir fuentes con metadatos incorrectos o sin texto completo

### Fase 3: Redacción (2-3 horas)
1. Usar `redactor-academico` para crear `BORRADOR.md`
2. Seguir estructura de la plantilla EXACTAMENTE
3. Citar todas las afirmaciones verificables
4. Mantener 13-20 fuentes (suficiente para revisión integrativa)
5. NO incluir resumen ni palabras clave (para entregas académicas)

### Fase 4: Revisión (1 hora)
1. Usar `editor-critico` para revisión de fondo
2. Usar `auditor-fuentes` para trazabilidad de citas
3. Usar `revisor-apa` para formato APA 7.ª
4. Corregir hallazgos críticos y altos

### Fase 5: Limpieza y exportación (15 min)
1. Eliminar TODOS los comentarios HTML del borrador
2. Eliminar marcadores de pendientes
3. Copiar contenido limpio a la aplicación web
4. Exportar a Word
5. Revisar formato visual

## 2. Reglas críticas de la profesora

### Estructura obligatoria
- **Título:** ≤20 palabras, sin siglas ni fórmulas
- **Autores:** Nombre + Institución + Programa + Correo (nota al pie)
- **Introducción:** ≤8 párrafos, TODOS citados, último párrafo = objetivo general
- **Metodología:** Subtítulos 2.1-2.5 OBLIGATORIOS
- **Resultados:** Subtítulos 3.1-3.5 opcionales (solo informativos)
- **Discusión:** Interpretar, NO repetir resultados
- **Conclusiones:** Responder al objetivo general
- **Referencias:** APA 7.ª, número citas = número referencias

### Lo que NO incluir
- ❌ Resumen/Abstract
- ❌ Palabras clave
- ❌ Objetivos específicos (solo general)
- ❌ Comentarios HTML en el borrador final
- ❌ Marcadores de pendientes

## 3. Errores comunes y cómo evitarlos

### Errores de citación
| Error | Solución |
|-------|----------|
| Atribuir conclusiones a fuente equivocada | Verificar en texto original quién dice qué |
| Generalizar datos de un contexto específico | Acotar: "en el caso de X" o "específicamente sobre Y" |
| Citas sin fuente en matriz | Toda cita debe tener fila en MATRIZ_FUENTES.md |
| Referencias sin citar | Verificar correspondencia 1:1 |

### Errores de metadatos
| Error | Solución |
|-------|----------|
| DOI incorrecto | Verificar en Crossref antes de citar |
| Año ambiguo | Usar copyright del documento, no fecha de acceso |
| Revista incorrecta | Verificar en Crossref, no en buscadores |
| Paginación faltante | Marcar como pendiente, no inventar |

### Errores de formato
| Error | Solución |
|-------|----------|
| "&" vs "y" | APA 7.ª usa "&"; verificar con profesor |
| Orden alfabético | Apellidos con "de" se ordenan bajo la inicial del apellido |
| Cursivas perdidas | Verificar en documento original |

## 4. Fuentes de información útiles

### Para verificar metadatos
- **Crossref:** https://api.crossref.org/works/{DOI}
- **DataCite:** https://api.datacite.org/dois/{DOI}
- **Google Scholar:** Búsqueda directa del título

### Para buscar fuentes
- **Google Scholar:** Límite de tasa (429) - usar alternativas
- **SciELO:** Puede bloquear (403) - usar Playwright
- **RedALyC:** Búsqueda interactiva requerida
- **CEPAL Repositorio:** Puede bloquear (403)

### Para verificar contenido
- **Playwright MCP:** Navegación interactiva
- **webfetch:** Páginas estáticas
- **Crossref API:** Metadatos bibliográficos

## 5. Checklist antes de entregar

### Contenido
- [ ] Título ≤20 palabras
- [ ] Introducción ≤8 párrafos citados
- [ ] Metodología 2.1-2.5 completos
- [ ] Resultados 3.1-3.5 completos
- [ ] Discusión interpretativa
- [ ] Conclusiones responden al objetivo
- [ ] Número citas = número referencias

### Formato APA 7.ª
- [ ] "&" entre autores
- [ ] Año en paréntesis
- [ ] DOI como URL
- [ ] Orden alfabético correcto
- [ ] Cursivas en títulos de revistas

### Limpieza
- [ ] Sin comentarios HTML
- [ ] Sin marcadores de pendientes
- [ ] Datos del autor completos
- [ ] Referencias sin errores de metadatos

### Exportación
- [ ] Exportado a Word
- [ ] Portada correcta
- [ ] Márgenes 2.54 cm
- [ ] Doble espaciado
- [ ] Times New Roman 12pt

## 6. Tiempos estimados

| Fase | Tiempo estimado |
|------|-----------------|
| Planificación | 30 minutos |
| Investigación de fuentes | 1-2 horas |
| Redacción | 2-3 horas |
| Revisión | 1 hora |
| Limpieza y exportación | 15 minutos |
| **Total** | **4-6 horas** |

## 7. Plantilla de MATRIZ_FUENTES.md

```markdown
| ID | Referencia (datos verificados) | Tipo | Afirmación que respalda | URL/DOI | Limitaciones | Estado |
|---|---|---|---|---|---|---|
| W01 | Autor, A. (Año). Título. *Revista*, *vol*(núm). DOI | Tipo | (1) Afirmación 1 (2) Afirmación 2 | URL | Limitaciones | Verificado/Pendiente |
```

## 8. Plantilla de BORRADOR.md (estructura)

```markdown
# Título del artículo (≤20 palabras)

**Autores**

Nombre Completo¹

¹ Institución, Programa, Correo@institucion.edu.co

## 1. Introducción

[7 párrafos, todos citados, último = objetivo general]

## 2. Metodología de revisión

### 2.1. Tipo de revisión
### 2.2. Fuentes de información
### 2.3. Estrategia de búsqueda
### 2.4. Criterios de inclusión y exclusión
### 2.5. Selección y análisis de los documentos

## 3. Resultados

### 3.1. Antecedentes y evolución del tema
### 3.2. Fundamentos teóricos y conceptuales
### 3.3. Principales avances y hallazgos
### 3.4. Aplicaciones y perspectivas actuales
### 3.5. Limitaciones y vacíos de conocimiento

## 4. Discusión

[Interpretar, contrastar, mostrar desacuerdos]

## 5. Conclusiones

[Responder al objetivo, explicitar límites]

## 6. Referencias

[APA 7.ª, orden alfabético, DOI como URL]
```
