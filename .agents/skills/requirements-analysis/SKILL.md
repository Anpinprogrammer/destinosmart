# Skill — requirements-analysis

## Cuándo aplicar
En `/sdd-clarify` y `/sdd-spec` cuando hay visión en lenguaje natural, PDF o solicitudes informales.

## Procedimiento
- Separar citas/hechos de la fuente de hipótesis o recomendaciones.
- Extraer actores, objetivo, pre/postcondiciones, reglas, excepciones, datos, permisos y dependencias.
- Formular preguntas sobre términos ambiguos (ej. “tiempo real”, “ilimitado”, “integrada”).
- Redactar requisitos con un solo comportamiento observable por requisito.
- Definir AC Given/When/Then tanto positivos como negativos; comprobar límites y errores.
- Mantener mapa fuente → FR/NFR → AC; anotar lo que falta o no se acordó.

## Salida
Tabla `Origen | Requisito | AC | Estado | Pregunta`; sin afirmaciones no respaldadas.
