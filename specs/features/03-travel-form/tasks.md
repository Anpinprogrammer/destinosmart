# Feature 03 — Formulario inteligente de viaje | Backlog SDD

- **feature_id:** `03-travel-form`
- **version:** `0.3.0`
- **status:** `draft`
- **references:** `spec.md` v0.3.0, `clarifications.md` v0.1.0 y `plan.md` v0.3.0.
- **execution:** ninguna tarea de implementación está autorizada hasta G1–G3 aprobados.

## 1. Definición de Ready (DoR)
- [x] CQ-01–CQ-05 registradas en `clarifications.md`; detalles non-blocking documentados.
- [ ] Auditoría de `prototipos/prototipo-gpt` y su dashboard realizada (solo lectura).
- [ ] `spec.md` aprobado por el propietario con versión y fecha.
- [ ] Auditoría de componentes, Design System, landing y routing realizada (solo lectura).
- [ ] Contrato de integración, reglas de fechas, moneda y validación definidos.
- [ ] `plan.md` aprobado, con tabla de archivos susceptibles de cambio y sin migraciones.
- [ ] Dependencias con 02/04/05/06 revisadas; los servicios no implementados se marcan como bloqueados.
- [ ] Comandos de test disponibles identificados; instalar paquetes no está autorizado.

## 2. Backlog con trazabilidad
| ID | Tarea verificable | Dependencia | FR/AC | Evidencia / Done |
|---|---|---|---|---|
| TASK-001 | Auditar `prototipos/prototipo-gpt`: hero, formulario, dashboard, componentes, routing y scripts (solo lectura) | — | FR-001/012, AC-001/012/022 | Inventario archivo→uso, capturas y git/estado |
| TASK-002 | Confirmar CQ-01–CQ-05 y detalles non-blocking; registrar en clarifications/ADR si aplica | TASK-001 | FR-002–011, AC-002–011 | Decisiones 2026-10-21 en `clarifications.md`; no inventar catálogo/edades/moneda |
| TASK-003 | Aprobar esquema `TravelFormDraft` normalizado (`id/label`, adultos/menores, presupuesto ISO) y payload; validar consumidores | TASK-002 | FR-009, AC-009 | Tipos/esquema revisados; pendientes non-blocking explícitos |
| TASK-004 | Registrar diff planificado y proteger archivos fuera de alcance | TASK-001–003 | FR-012, AC-012 | Matriz archivo/cambio/razón con aprobación |
| TASK-005 | Conectar controles existentes a estado tipado del formulario | G3 + TASK-004 | FR-001–004/007, AC-001–004/007 | Interacción sin pérdida de valores y tests |
| TASK-006 | Implementar selección modular y control «Servicios completos» derivado | TASK-005 | FR-005/006, AC-005/006 | Tests selección parcial/total y deselección |
| TASK-007 | Integrar validaciones aprobadas con errores accesibles | TASK-005/006 | FR-008, AC-003/004/007/008/013 | Tests campos y navegación teclado |
| TASK-008 | Normalizar borrador en solicitud tipada; prohibir payload inválido | TASK-003/007 | FR-009, AC-009 | Unit tests de mapping/normalización |
| TASK-009 | Preparar interfaz de envío; integrar receptor solo si contrato backend está aprobado | TASK-008 + contrato servidor | FR-010/011, AC-010/011 | Payload/estados; creación real **fuera de Feature 03/bloqueada** |
| TASK-010 | Proteger submit repetido y mantener datos al fallar | TASK-009 o adaptador de envío aprobado | FR-011, AC-011 | Prueba de doble submit/error y reintento |
| TASK-011 | Ejecutar pruebas responsive, accesibilidad y animaciones con UI existente | TASK-005–010 aplicables | NFR-001/003/004, AC-013/014 | Reporte y capturas |
| TASK-012 | Ejecutar typecheck, suite existente, revisión de secretos y regresión del hero/dashboard | TASK-005–011 aplicables | NFR-002/006/007, AC-012/014 | Comandos, resultados y diff verificado |
| TASK-013 | Reviewer evalúa trazabilidad, alcance y cambios; propietario acepta | TASK-012 | Todos | Review con hallazgos y aprobación explícita |

Las tareas 005–013 son **futuras**, no instrucciones de ejecución inmediata. TASK-009/TASK-010 podrían posponerse hasta que RF-02/03 y control de cuotas dispongan de contratos reales, si así se aprueba.

## 3. Secuencia de comandos del harness (uso condicionado)
1. `/sdd-clarify` completado: CQ-01–CQ-05 registradas en `clarifications.md`; G0 satisfecho con pendientes non-blocking.
2. `/sdd-spec` para consolidar y solicitar aprobación G1 de `spec.md`.
3. `/sdd-plan` para adaptar este plan al repositorio real y solicitar G2.
4. `/sdd-tasks` para confirmar tareas y aprobar G3.
5. `/sdd-implement` **solo** por instrucción posterior explícita y cuando G0–G3 estén aprobados.

## 4. Escenarios de prueba trazables
- **S-01:** formulario visible, hero intacto → AC-001/012.
- **S-02:** edición de origen/destino y fechas válidas/inválidas → AC-002/003.
- **S-03:** límites de pasajeros aprobados → AC-004.
- **S-04:** categorías independientes y activar/desactivar selección completa → AC-005/006.
- **S-05:** presupuesto ausente y presente inválido → AC-007.
- **S-06:** errores de campo, foco y retención de valores → AC-008/013.
- **S-07:** payload normalizado sin sexta categoría `all` → AC-009.
- **S-08:** envío real con receptor aprobado, falla, reintento, doble submit → AC-010/011 (bloqueado sin API).
- **S-09:** responsive y reduced motion → AC-013/014.
- **S-10:** TypeScript y diff sin dependencias, routing o design system alterados → AC-012/014.
- **S-19:** borrador `sessionStorage` válido/vencido/corrupto, restauración tras login y ausencia de secretos → AC-023.
- **S-20:** payload `CreateTripRequestV1` y errores Core 07; Feature 03 no crea viaje → AC-024.
- **S-21:** auditoría UI: hero/formulario/dashboard de referencia sin reemplazo ni routing nuevo → AC-025.

## 5. Definición de Done (DoD)
- [ ] Todos los criterios AC aplicables tienen evidencia y pruebas ejecutadas.
- [ ] No existen defectos bloqueantes de accesibilidad, validación ni seguridad de integración.
- [ ] Los escenarios que requieran API se marcan **bloqueados**, no falsamente completados.
- [ ] No hay datos de precios/itinerarios inventados ni llamadas directas desde navegador a OpenRouter.
- [ ] Sin migraciones, reestructuración, cambios de Design System, instalaciones de paquetes o cambios de routing no autorizados.
- [ ] Informe reviewer y aceptación humana registrados.

## 6. Registro de ejecución (por completar durante implementación)
| TASK | Estado | Responsable | Commit/archivo | Pruebas/evidencia | Bloqueantes |
|---|---|---|---|---|---|
| TASK-001–013 | NOT_STARTED | — | — | — | G1–G3 pendientes; G0 satisfecho |

**Gate G3:** pendiente de aprobación. **G4:** no autorizado. **G0:** satisfecho; G1/G2 pendientes.

## 7. Adenda de tareas — Transición a DestinoSmart Freemium
> Las tareas siguientes son **propuestas pendientes**, no autorización para ejecutarlas. Las Features 02/04/07 poseen los controles de backend; Feature 03 integra UI y el payload de manera incremental.

| ID | Tarea SDD verificable | Bloqueante | Trazabilidad / Evidencia |
|---|---|---|---|
| TASK-014 | Confirmar que trial de 14 días y 3 consultas anónimas quedan reemplazados; enlazar CR-003/Freemium | G1 | BR-F03-01–07; revisión documental |
| TASK-015 | Auditar en modo lectura `prototipos/prototipo-gpt` (hero/formulario/dashboard), sesión, router y componentes protegidos | TASK-001 | AC-022/025; inventario archivo→cambio |
| TASK-016 | Confirmar detalles non-blocking de borrador/login y estados de paywall/errores | TASK-002 | AC-017/020; `clarifications.md` §5 |
| TASK-017 | Validar contrato tipado de creación e idempotencia con Features 02/04/07 sin construir backend | TASK-003 + Features 02/04/07 | AC-016/018/019/021; contrato versionado y aprobado |
| TASK-018 | Adaptar formulario existente a envío autorizado respetando el Design System, **solo tras G3 y autorización de cambios puntuales** | TASK-015–017 + G3 | AC-015/016/017/020/022; diff aprobado |
| TASK-019 | Integrar UX de estado, login y paywall con errores backend y preservación de borrador, sin duplicar reglas de permisos | TASK-018 + Feature 04 | AC-017/020/021/022; pruebas componentes |
| TASK-020 | Ejecutar pruebas de integración con backend real: primer viaje, doble solicitud, rollback, segundo viaje y paid | TASK-017–019 + backend autorizado | AC-015–021; resultados verificables |
| TASK-021 | Reviewer inspecciona límites de alcance, RGPD/privacidad de borradores, accesibilidad y regresión visual | TASK-020 o reportar bloqueos | AC-022; revisión con aprobación explícita |
| TASK-022 | Implementar borrador `sessionStorage` (TTL 30 min, validación, restauración/limpieza) sin secretos | TASK-002/015 + G3 | AC-023; NFR-008 | Tests TTL/restauración/privacidad |
| TASK-023 | Crear adaptador `TravelFormDraft → CreateTripRequestV1` y estados de error; no llamar al endpoint | TASK-003/017 | AC-024 | Contract/unit tests; no creación real |

### Nuevas pruebas obligatorias
- **S-11:** sin crédito consumido por llenar o validar el formulario → AC-015.
- **S-12:** primer viaje Free, transacción y expiración 30 días establecida en servidor → AC-016 (depende de Feature 07).
- **S-13:** segundo viaje Free → error contractual + paywall + inputs intactos → AC-017.
- **S-14:** doble clic/solicitudes simultáneas/reintento → como máximo un viaje y un crédito → AC-018.
- **S-15:** fallo de sesión/BD → rollback sin consumo → AC-019.
- **S-16:** visitante anónimo no crea viaje sin autenticación → AC-020.
- **S-17:** plan pago vigente permite crear según capacidad; revisar transición si cancelación → AC-021.
- **S-18:** diff de UI y configuración sin migraciones ni reemplazo de prototipos → AC-022.

### Alcance de aprobación
Esta adenda **no requiere ejecutar ningún TASK** ahora; G0 está satisfecho, pero G1/G2/G3 no. Si otro agente está implementando Feature 01 o 02, detener cambios concurrentes antes de integrar Feature 03 y confirmar que los Core actualizados tienen precedencia sobre specs antiguas. Resolver conflictos documentales mediante `/sdd-clarify`, obtener G1/G2/G3 y después autorización específica para `/sdd-implement`.
