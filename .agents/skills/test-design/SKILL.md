# Skill — test-design

## Aplicación
Durante spec, plan, tasks, review e implementación.

## Estrategia
- Traducir cada AC en uno o varios casos reproducibles.
- Considerar particiones de equivalencia, límites, estados inválidos y concurrencia.
- Priorizar unit, contract, integration y e2e según riesgo.
- Probar permisos y multiusuario en servidor; no confiar en UI.
- Usar fixtures/mocks; prohibidas transacciones reales con proveedores.
- Para IA: validar contrato JSON, consistencia, errores, costos, alucinaciones y fuentes.
- Reportar método, comando, entorno, resultado y limitaciones.

## Criterio
Sin evidencia ejecutada: `NOT_VERIFIED`, no `PASS`.
