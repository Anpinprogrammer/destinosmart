# Skill — architecture-design

## Cuándo aplicar
Durante `/sdd-plan`, tras spec aprobada.

## Checklist
- Identificar restricciones reales y decisiones pendientes.
- Delimitar dominio, capas, responsabilidades y dependencias.
- Diseñar contratos de API tipados con versiones y errores.
- Modelar persistencia, consistencia, migraciones y caché (invalidez/TTL).
- Considerar autorización, idempotencia, concurrencia, cuotas, fallos de proveedores y reintentos.
- Comparar al menos dos enfoques cuando la elección afecte operabilidad/costo.
- Definir tests por capa, seguridad, observabilidad, despliegue y reversión.

## Reglas
No confundir recomendaciones con decisiones aprobadas. Crear ADR ante elección transversal.
