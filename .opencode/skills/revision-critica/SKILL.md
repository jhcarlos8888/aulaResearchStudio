---
name: revision-critica
description: Revisa la lógica, la estructura, la evidencia, el estilo y la adecuación del trabajo al encargo.
compatibility: OpenCode
---
# Skill: revisión crítica

Evalúa el documento contra el encargo y no solo por su fluidez superficial.

## Matriz de revisión
- **Adecuación:** responde a la pregunta, cubre los requisitos y respeta el alcance.
- **Tesis/propósito:** identifica la afirmación central y comprueba que sea defendible.
- **Estructura:** orden lógico; cada sección tiene un propósito; los subtítulos reflejan el contenido.
- **Argumentación:** separa afirmación, evidencia, razonamiento, contraargumento y matiz.
- **Fuentes:** representatividad, autoridad, vigencia, desacuerdos, sesgo de selección, citas sin respaldo y datos no trazables.
- **Metodología:** correspondencia entre pregunta, método, datos y conclusión; ninguna actividad inventada.
- **Conclusión:** responde el propósito sin introducir hallazgos nuevos ni afirmar causalidad no demostrada.
- **Estilo:** claridad, precisión, transiciones, repeticiones, errores y adecuación al nivel académico.
- **Cumplimiento:** extensión, secciones, citación y requisitos del docente.

## Salida requerida
Escribe `INFORME_REVISION.md` con prioridad (crítica/alta/media/menor), ubicación, hallazgo, por qué importa, cambio sugerido y si necesita decisión humana. No modifiques una cita en silencio si la corrección depende de datos bibliográficos desconocidos. Distingue errores verificables de recomendaciones de estilo.

## Integridad de la propia verificación
- **Una comprobación que nunca falla no comprueba nada.** Cuando añadas una prueba o un chequeo nuevo, pásalo contra el código o el documento **anterior al arreglo**: debe fallar. Si también pasa con el defecto presente, la prueba es decorativa y no protege de regresiones.
- **Si una prueba nueva falla, sospecha primero del propio test.** Comprueba que los datos de prueba son válidos (un fichero de imagen generado mal no prueba nada del programa). Depura el artilugio antes de concluir que el producto está roto.
- **Verifica el artefacto, no el mensaje.** «La exportación devolvió ok» no dice que la figura esté dentro. Descomprime el `.docx`, cuenta `word/media/`, comprueba relaciones, dimensiones y que no haya avisos de fallo incrustados.
- **No confundas ausencia de prueba con prueba de ausencia.** Un grep que devuelve 0 casi siempre es un patrón mal escrito; comprueba la herramienta antes de concluir que el contenido no existe.
