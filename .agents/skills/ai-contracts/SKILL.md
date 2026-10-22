# Skill — ai-contracts (OpenRouter v4.0)

## Aplicación
Solo cuando se especifiquen las futuras funcionalidades IA del PRODUCTO. Esta skill regula su diseño; **no implementa agentes de negocio**.

## Checklist
- Definir input/output como esquemas versionados y tipados.
- Distinguir datos verificados, aproximaciones y contenido generado.
- Exigir procedencia/fecha para precios, inventarios y disponibilidad cuando existan.
- Presupuestos y límites: timeouts, tokens, costo, backoff, circuit breakers y fallback.
- Pruebas contractuales y datasets de evaluación sin PII; seguridad ante instrucciones maliciosas de terceros.
- Prohibir que un LLM realice cobros o reservas sin confirmación y verificación por backend.

## Salida
Contrato, evaluación, límites, riesgos, estrategia de degradación.

La integración de IA en el producto se prevé mediante OpenRouter a través de Edge Functions. Los nombres/versiones de modelos del PDF son candidatos y deben verificarse antes de cada especificación; cálculos y divisas requieren fuentes de datos y operaciones deterministas, no confiar en precisión numérica del LLM.
