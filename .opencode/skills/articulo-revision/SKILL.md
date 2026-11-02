---
name: articulo-revision
description: Guía completa para redactar artículos de revisión académicos según plantilla SENA/CUN y normas APA 7.ª edición. CÁRGALA cuando el usuario solicite un artículo de revisión, revisión de literatura o trabajo similar.
---

# Skill: Artículo de Revisión Académica

## Flujo de trabajo obligatorio

### 1. Planificación (ANTES de redactar)
- Leer `BRIEF.md`, `PROMPT_OPENCODE.md`, plantilla y transcripción
- Crear `PLAN_INVESTIGACION.md` con pregunta, objetivos, metodología
- Definir estructura según plantilla del docente

### 2. Investigación de fuentes
- Crear/actualizar `MATRIZ_FUENTES.md`
- Verificar CADA fuente abriendo la página original
- Registrar: autor, año, título, revista, DOI/URL, afirmaciones, limitaciones
- Excluir fuentes con metadatos incorrectos o sin texto completo
- Mínimo 13-20 fuentes para revisión integrativa

### 3. Redacción
- Usar `redactor-academico` para crear `BORRADOR.md`
- Seguir estructura de plantilla EXACTAMENTE
- Citar TODAS las afirmaciones verificables
- NO incluir resumen ni palabras clave
- Último párrafo de introducción = objetivo general

### 4. Revisión
- `editor-critico`: revisión de fondo y lógica
- `auditor-fuentes`: trazabilidad de citas
- `revisor-apa`: formato APA 7.ª
- Corregir hallazgos críticos y altos

### 5. Limpieza final
- Eliminar TODOS los comentarios HTML (`<!-- -->`)
- Eliminar marcadores de pendientes
- Copiar contenido limpio para exportar

## Estructura obligatoria (según plantilla SENA/CUN)

```
# Título (≤20 palabras, sin siglas ni fórmulas)

**Autores**
Nombre¹
¹ Institución, Programa, Correo@institucion.edu.co

## 1. Introducción (≤8 párrafos, TODOS citados)
- Párrafo 1-2: Contextualización y antecedentes
- Párrafo 3: Importancia
- Párrafo 4: Problemática
- Párrafo 5: Justificación
- Párrafo 6: Pregunta de investigación
- Párrafo 7: Objetivo general (ÚLTIMO)

## 2. Metodología de revisión (subtítulos OBLIGATORIOS)
### 2.1. Tipo de revisión
### 2.2. Fuentes de información
### 2.3. Estrategia de búsqueda
### 2.4. Criterios de inclusión y exclusión
### 2.5. Selección y análisis de los documentos

## 3. Resultados (subtítulos opcionales)
### 3.1. Antecedentes y evolución del tema
### 3.2. Fundamentos teóricos y conceptuales
### 3.3. Principales avances y hallazgos
### 3.4. Aplicaciones y perspectivas actuales
### 3.5. Limitaciones y vacíos de conocimiento

## 4. Discusión (interpretar, NO repetir resultados)

## 5. Conclusiones (responder al objetivo)

## 6. Referencias (APA 7.ª, número citas = número referencias)
```

## Reglas críticas

### Lo que SÍ incluir
- ✅ Título claro y específico (≤20 palabras)
- ✅ Autores con nota al pie completa
- ✅ Introducción con ≤8 párrafos citados
- ✅ Metodología con subtítulos 2.1-2.5
- ✅ Resultados con subtítulos 3.1-3.5
- ✅ Discusión interpretativa
- ✅ Conclusiones que responden al objetivo
- ✅ Referencias APA 7.ª (citas = referencias)

### Lo que NO incluir
- ❌ Resumen/Abstract
- ❌ Palabras clave
- ❌ Objetivos específicos (solo general)
- ❌ Comentarios HTML en borrador final
- ❌ Marcadores de pendientes
- ❌ Datos inventados o no verificados

## Formato APA 7.ª

### Citas en texto
- 1-2 autores: (Apellido, Año) o (Apellido & Apellido, Año)
- 3+ autores: (Apellido et al., Año)
- Primera cita: usar "&" entre autores
- Sin autor: usar título abreviado

### Referencias
- Orden alfabético por apellido
- Apellidos con "de" se ordenan bajo la inicial del apellido
- DOI como URL: https://doi.org/xxxxx
- Títulos de revistas en cursiva
- Año en paréntesis

## Errores comunes a evitar

1. **Atribuir conclusiones a fuente equivocada** → Verificar en texto original
2. **Generalizar datos específicos** → Acotar contexto
3. **Citas sin fuente en matriz** → Toda cita debe tener fila
4. **DOI incorrecto** → Verificar en Crossref
5. **Año ambiguo** → Usar copyright, no fecha de acceso
6. **Referencias sin citar** → Verificar correspondencia 1:1

## Fuentes de verificación

- **Crossref:** https://api.crossref.org/works/{DOI}
- **DataCite:** https://api.datacite.org/dois/{DOI}
- **Playwright:** Para páginas que bloquean webfetch
- **webfetch:** Para páginas estáticas

## Tiempos estimados

| Fase | Tiempo |
|------|--------|
| Planificación | 30 min |
| Investigación fuentes | 1-2 horas |
| Redacción | 2-3 horas |
| Revisión | 1 hora |
| Limpieza/exportación | 15 min |
| **Total** | **4-6 horas** |

## Comprobación de calidad

Antes de entregar, verificar:
- [ ] Título ≤20 palabras
- [ ] Introducción ≤8 párrafos citados
- [ ] Metodología 2.1-2.5 completos
- [ ] Número citas = número referencias
- [ ] Sin comentarios HTML
- [ ] Datos del autor completos
- [ ] Formato APA 7.ª correcto
