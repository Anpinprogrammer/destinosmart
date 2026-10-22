# SDD MASTER TASK — Core Architecture Alignment & Freemium Migration

Actúa como **Principal Software Architect, Lead Backend Architect y experto en Spec-Driven Development (SDD)**.

Estamos desarrollando **DestinoSmart**, anteriormente denominado Travel Planner AI, una plataforma SaaS de planificación inteligente de viajes.

Actualmente el proyecto se encuentra en una fase temprana de desarrollo: las Features 01 (Landing Page) y 02 (Autenticación y usuarios) están comenzando a implementarse.

Tu misión consiste en **auditar, corregir, actualizar y consolidar todas las especificaciones globales (`specs/core/`)**, incorporando el nuevo modelo de monetización Freemium basado en un viaje gratuito con acceso Pro durante 30 días.

Este trabajo es prioritario y debe completarse antes de continuar implementando nuevas features.

---

## 1. OBJETIVO PRINCIPAL

Crear una fuente de verdad arquitectónica única, consistente y verificable para DestinoSmart.

Debes:

1. Analizar el estado actual del repositorio.
2. Identificar todas las especificaciones Core existentes.
3. Leer las decisiones arquitectónicas y de negocio aprobadas.
4. Identificar contradicciones con el antiguo modelo de prueba gratuita.
5. Actualizar los diez documentos Core.
6. Revisar las dependencias entre especificaciones.
7. Actualizar la trazabilidad de requisitos.
8. Identificar el impacto sobre las Features 01 y 02.
9. Ejecutar una revisión de consistencia documental.
10. Presentar un reporte de los cambios y decisiones pendientes.

**No debes implementar código ni modificar infraestructura durante esta tarea.**

---

## 2. FUENTES DE VERDAD Y PRECEDENCIA

Antes de modificar documentación, inspecciona:

- `AGENTS.md`
- `MEMORY.md`
- `docs/constitution.md`
- `docs/tech-stack.md`
- `docs/open-questions.md`
- `docs/requirements-traceability.md`
- `docs/decisions/`
- `docs/changes/`
- `specs/core/`
- `specs/features/01-landing-page/`, si existe
- `specs/features/02-authentication/`, si existe
- `.agents/agents/`
- `.agents/skills/`
- `.opencode/commands/`

También debes localizar y consultar el Documento Maestro Travel Planner AI v4.0, si se encuentra disponible.

### Orden de precedencia

1. Instrucciones explícitas del propietario.
2. Decisiones Freemium aprobadas y registradas en ADR/CR.
3. Constitución del proyecto, excepto las reglas anteriores que hayan quedado explícitamente sustituidas.
4. Especificaciones globales vigentes.
5. Documento Maestro v4.0, para todos los requisitos que no hayan sido modificados.
6. Código real del repositorio, como evidencia de la implementación existente.
7. Propuestas técnicas nuevas, identificadas como pendientes de aprobación.

El documento maestro v4.0 sigue siendo válido para las funcionalidades generales de la plataforma, pero **sus reglas anteriores de monetización quedan sustituidas por las decisiones Freemium aprobadas**.

Si algún archivo de decisión no existe o resulta incompleto, identifica la ausencia. No inventes contenido ni asumas que una regla fue aprobada.

---

## 3. NUEVAS REGLAS DE NEGOCIO OBLIGATORIAS

Estas reglas están aprobadas y deben reflejarse de manera consistente en todos los documentos afectados.

### BR-FREE-001 — Crédito inicial

Todo usuario nuevo registrado recibe:

- `plan_id = 'free'`
- `free_trip_credits = 1`

El crédito permite crear un único viaje gratuito completo.

### BR-FREE-002 — Consumo del crédito

Cuando el usuario Free crea exitosamente su primer viaje:

- Se consume un crédito.
- El viaje se identifica como viaje gratuito bonificado.
- Se activa su período Pro gratuito.
- La creación y el consumo deben ser atómicos.

Si falla la operación, el crédito no debe consumirse.

### BR-FREE-003 — Acceso premium

El primer viaje gratuito tiene acceso a todas las funcionalidades Pro disponibles para ese viaje, incluyendo:

- Presupuestos con IA sin límites de generación propios del trial.
- Itinerarios completos.
- Edición y reorganización del itinerario.
- Exportación PDF.
- Chatbot de IA.
- Alertas de precios.
- Reservas integradas.

El acceso a reservas no implica gratuidad de vuelos, hoteles, actividades o tarifas de proveedores externos.

### BR-FREE-004 — Vigencia

El período Pro gratuito dura exactamente **30 días consecutivos desde la creación exitosa del primer viaje**.

La fecha de creación debe establecerse mediante el backend, utilizando una referencia horaria confiable.

El vencimiento se determina como:

`free_pro_expires_at = created_at + interval '30 days'`

Se recomienda persistir la fecha de vencimiento o definir una derivación inequívoca y consistente.

La fecha de registro, la fecha de salida del viaje y su última edición no modifican el comienzo ni la duración del beneficio.

### BR-FREE-005 — Bloqueo del segundo viaje

Si el usuario está en Free y ya consumió su crédito:

- No puede crear un segundo viaje.
- El backend rechaza la operación.
- React presenta un paywall de suscripción.

No debe ser posible evitar este control manipulando el frontend o realizando solicitudes directas.

### BR-FREE-006 — Eliminación

Eliminar el primer viaje gratuito no devuelve el crédito.

El usuario no adquiere el derecho a crear un nuevo viaje Free.

### BR-FREE-007 — Vencimiento y solo lectura

Cuando termina el período de 30 días:

- El primer viaje permanece almacenado.
- El usuario puede consultar su información.
- El usuario puede acceder a los PDF previamente generados.
- El usuario puede consultar sus reservas existentes.
- Las operaciones premium nuevas requieren una suscripción habilitante.
- No se devuelve el crédito gratuito.
- No se reinicia la vigencia.

### BR-FREE-008 — Suscripciones

Los planes comerciales son:

- Free: USD 0.
- Viajero Ocasional: USD 4.99/mes.
- Viajero Frecuente: USD 9.99/mes.

Los planes pagos permiten crear viajes ilimitados.

Las cuotas específicas de uso de IA permanecen pendientes de aprobación.

No inventes límites diarios, mensuales o de tokens.

### BR-FREE-009 — Cancelación

Cuando una suscripción deja de conceder derechos premium:

- Los viajes existentes permanecen almacenados.
- El usuario mantiene acceso de solo lectura.
- Los PDF ya generados permanecen accesibles según la política de conservación aplicable.
- El crédito gratuito no se reinicia.

El momento exacto de pérdida de derechos tras la cancelación sigue pendiente de definición.

### BR-FREE-010 — Autoridad de permisos

El backend es la autoridad para determinar:

- Creación de viajes.
- Consumo de créditos.
- Vigencia premium.
- Acceso al chatbot.
- Generación de presupuestos e itinerarios.
- Generación de PDF.
- Configuración y ejecución de alertas.
- Operaciones de reserva.
- Permisos sobre viajes históricos.

React únicamente refleja estos permisos.

Los hooks y componentes frontend no pueden sustituir las comprobaciones del backend.

---

## 4. RESTRICCIÓN CRÍTICA: NO MODIFICAR INFRAESTRUCTURA

Ya existe un Design System, una Landing Page y prototipos de dashboards.

Están protegidos.

**PROHIBIDO SIN AUTORIZACIÓN EXPLÍCITA:**

- Modificar componentes React.
- Cambiar el Design System.
- Cambiar frameworks o dependencias.
- Modificar routing, incluyendo TanStack Router si está instalado.
- Modificar configuración de Vite, TypeScript o Tailwind.
- Instalar o eliminar paquetes.
- Crear o ejecutar migraciones Supabase.
- Modificar funciones SQL o triggers.
- Crear Edge Functions.
- Crear hooks React.
- Modificar archivos de aplicación.
- Cambiar los prototipos de Landing Page o Dashboard.
- Ejecutar despliegues.
- Modificar servicios externos.

Puedes inspeccionar archivos de código en modo lectura para comprender el estado actual.

La tarea solo autoriza modificaciones documentales dentro de las rutas indicadas en la sección 8.

Si detectas problemas técnicos, documéntalos y propón su resolución.

**Una recomendación arquitectónica no es una autorización de implementación.**

---

## 5. ACTUALIZACIÓN DE LOS DIEZ CORE

Debes actualizar o, si no existen, preparar los siguientes documentos.

### CORE 01 — Product Overview

`specs/core/01-product-overview.md`

Actualizar:

- Nombre del producto a DestinoSmart.
- Modelo de monetización Freemium.
- Un viaje gratuito por usuario.
- Acceso Pro completo durante 30 días.
- Nuevos precios de suscripción.
- Política de vencimiento.
- Estado de solo lectura.
- Dependencias de funcionalidades premium.
- Alcance del MVP.

Distinguir las funcionalidades confirmadas de las pendientes de priorización.

### CORE 02 — System Architecture

`specs/core/02-system-architecture.md`

Definir las responsabilidades arquitectónicas de:

- Frontend React.
- Supabase Auth.
- PostgreSQL.
- Políticas RLS.
- Supabase Edge Functions.
- Servicio centralizado de autorización.
- Subsistema de suscripciones.
- Contratos de acceso a IA.
- Ciclo de vida de viajes.

Incluir diagramas Mermaid cuando ayuden a comprender los flujos.

Documentar la arquitectura objetivo sin alterar la infraestructura actual.

### CORE 03 — Tech Stack

`specs/core/03-tech-stack.md`

Verificar el stack real del repositorio.

Documentar las tecnologías objetivo definidas:

- React.
- TypeScript estricto.
- Tailwind CSS.
- Framer Motion.
- Supabase.
- PostgreSQL.
- Supabase Auth.
- Supabase Edge Functions.
- OpenRouter.

Si TanStack Router existe en el proyecto, documentarlo como tecnología detectada.

No asumir que está instalado únicamente porque aparece en una propuesta.

No actualizar dependencias ni realizar migraciones tecnológicas.

### CORE 04 — Database Design

`specs/core/04-database-design.md`

Actualizar el modelo conceptual de datos.

Incluir al menos:

`profiles`
- `id`
- `plan_id`
- `free_trip_credits`

`trips`
- `id`
- `user_id`
- `is_free_trial_trip`
- `created_at`
- `free_pro_expires_at`

Analizar también la necesidad de:

- Historial de suscripciones.
- Eventos de consumo de créditos.
- Registro de operaciones.
- Estados de viaje.
- Historial de reservas.
- Metadatos de archivos PDF.

Documentar:

- Relaciones.
- Restricciones.
- Índices.
- Políticas RLS.
- Operaciones transaccionales.
- Idempotencia.
- Prevención de condiciones de carrera.
- Protección contra manipulación de créditos.

No crear migraciones ni modificar tablas reales.

No asumir que los esquemas propuestos ya existen.

### CORE 05 — Auth & Security

`specs/core/05-auth-security.md`

Actualizar:

- Registro y aprovisionamiento inicial.
- Trigger conceptual de creación de perfil.
- Separación entre autenticación y autorización.
- Permisos por usuario, plan y viaje.
- Permisos del viaje bonificado.
- Vencimiento automático.
- Política de solo lectura.
- Seguridad de operaciones premium.
- Protección contra escalada de privilegios.
- Manejo de secretos.
- RLS.

El backend debe verificar permisos en cada operación protegida.

### CORE 06 — Design System

`specs/core/06-design-system.md`

Conservar y documentar el Design System existente.

Solo actualizar la documentación necesaria para las nuevas experiencias de:

- Modal Paywall.
- Estado de prueba gratuita activa.
- Contador de vigencia.
- Notificación de vencimiento.
- Viaje en modo lectura.
- Estados de suscripción.

No crear diseños nuevos ni modificar tokens o componentes.

Si dichos patrones no existen, documentarlos como necesidades funcionales pendientes.

### CORE 07 — API Contracts

`specs/core/07-api-contracts.md`

Especificar contratos conceptuales para:

- Consultar permisos del usuario.
- Consultar permisos de un viaje.
- Crear un viaje.
- Consumir crédito gratuito.
- Consultar la fecha de vencimiento.
- Consultar derechos premium.
- Consultar información de suscripción.
- Manejar errores de límite alcanzado.
- Manejar errores de beneficio vencido.

Definir códigos de error estables, por ejemplo:

- `FREE_TRIP_LIMIT_REACHED`
- `FREE_PRO_EXPIRED`
- `SUBSCRIPTION_REQUIRED`
- `TRIP_READ_ONLY`
- `FORBIDDEN`
- `UNAUTHENTICATED`

Estos códigos deben quedar documentados como contratos propuestos, sujetos a validación.

No crear endpoints ni implementaciones.

### CORE 08 — AI Architecture

`specs/core/08-ai-architecture.md`

Documentar cómo las funcionalidades IA deberán consultar permisos centralizados.

Definir:

- Acceso a presupuestos.
- Acceso a itinerarios.
- Acceso al chatbot.
- Validación por viaje.
- Vigencia del trial.
- Límites futuros de uso de IA.
- Restricciones de costes.
- Contratos de autorización.

No implementar ni configurar agentes IA del producto.

No seleccionar nuevos modelos de OpenRouter sin validación.

### CORE 09 — Testing Strategy

`specs/core/09-testing-strategy.md`

Agregar pruebas para:

1. Registro con un crédito.
2. Creación del primer viaje.
3. Consumo atómico del crédito.
4. Bloqueo del segundo viaje.
5. Concurrencia.
6. Idempotencia.
7. Vigencia exacta de 30 días.
8. Acceso Pro antes del vencimiento.
9. Bloqueo de operaciones premium al vencer.
10. Acceso de solo lectura después del vencimiento.
11. Descarga de PDF existente.
12. Conservación de reservas confirmadas.
13. Eliminación sin devolución del crédito.
14. Cancelación de suscripción.
15. Acceso a viajes de otros usuarios.
16. Intentos de manipulación desde frontend.
17. Regresión de las Features 01 y 02.

Especificar escenarios Given/When/Then verificables.

### CORE 10 — Observability & Performance

`specs/core/10-observability-performance.md`

Incluir observabilidad para:

- Creación de perfiles.
- Consumo de créditos.
- Creación de viajes.
- Errores de permisos.
- Vencimientos.
- Rechazos del paywall.
- Operaciones premium.
- Activaciones y cancelaciones.
- Conflictos de concurrencia.
- Errores de servicios externos.

Definir métricas y eventos propuestos sin recopilar información personal innecesaria.

Conservar los requisitos de rendimiento y disponibilidad vigentes del documento maestro, indicando los límites que requieren validación.

---

## 6. TRAZABILIDAD DE REQUISITOS

Actualizar:

`docs/requirements-traceability.md`

Debes mantener la trazabilidad entre:

- Requisitos originales del Documento Maestro v4.0.
- Reglas Freemium aprobadas.
- Archivos Core.
- Features afectadas.
- Criterios de aceptación.
- Pruebas futuras.

No reutilizar IDs para requisitos diferentes.

Identificar expresamente los requisitos anteriores sustituidos por el nuevo modelo comercial.

No eliminar la historia de decisiones.

---

## 7. PROTECCIÓN DE FEATURES EN DESARROLLO

Actualmente hay trabajo en curso en:

- Feature 01 — Landing Page.
- Feature 02 — Autenticación y usuarios.

No modifiques directamente sus archivos `spec.md`, `plan.md`, `tasks.md` ni su implementación.

En su lugar, genera:

`docs/changes/CR-003-feature-alignment.md`

Debe contener:

- Requisitos nuevos que afectan a cada feature.
- Requisitos anteriores que quedan obsoletos.
- Cambios propuestos en sus especificaciones.
- Cambios técnicos futuros necesarios.
- Dependencias con la Feature 04 y la Feature 07.
- Riesgos de continuar implementando con especificaciones anteriores.
- Acciones necesarias antes de reanudar el desarrollo.

Incluye una advertencia clara sobre cualquier implementación que todavía utilice el trial de 14 días.

---

## 8. ARCHIVOS AUTORIZADOS PARA MODIFICACIÓN

Puedes crear o editar exclusivamente:

- `specs/core/*.md`
- `docs/requirements-traceability.md`
- `docs/open-questions.md`
- `docs/changes/CR-003-feature-alignment.md`
- `docs/changes/CR-003-core-alignment-report.md`

No modifiques ADR aprobados anteriores salvo autorización expresa.

Si necesitas corregir una decisión arquitectónica anterior, propón una nueva ADR que la sustituya.

No edites archivos fuera de esta lista.

Si los documentos contienen información aún no aprobada, mantenla identificada como DRAFT o PENDING.

---

## 9. FLUJO DE EJECUCIÓN SDD

Utiliza el harness existente.

### Fase A — Auditoría

El `planner` inspecciona la documentación y el repositorio.

Identifica:

- Inconsistencias.
- Reglas obsoletas.
- Archivos faltantes.
- Dependencias.
- Riesgos.
- Decisiones pendientes.

### Fase B — Actualización documental

El `planner` actualiza las diez especificaciones Core y la trazabilidad.

Solo puede modificar los archivos autorizados.

### Fase C — Revisión independiente

El `reviewer` verifica:

- Coherencia entre Core.
- Correspondencia con las decisiones Freemium.
- Ausencia de contradicciones.
- Integridad de requisitos.
- Preservación de arquitectura existente.
- Protección de Features 01 y 02.
- Ausencia de cambios de código.

### Fase D — Entrega

El `coordinator` presenta:

1. Archivos modificados.
2. Resumen de diferencias.
3. Reglas obsoletas reemplazadas.
4. Riesgos detectados.
5. Decisiones pendientes.
6. Estado de aprobación de cada Core.
7. Impacto sobre Features 01 y 02.
8. Recomendaciones antes de continuar.

No invoques `/sdd-implement`.

No ejecutes tareas técnicas de implementación.

---

## 10. CRITERIOS DE FINALIZACIÓN

La tarea documental termina cuando:

- Los diez Core están presentes y son consistentes.
- No queda ninguna referencia normativa vigente al antiguo trial de 14 días.
- Los precios oficiales documentados son USD 4.99 y USD 9.99.
- El beneficio Free se describe como un único viaje con Pro durante 30 días.
- El vencimiento y el modo lectura están correctamente definidos.
- Los permisos se centralizan conceptualmente en el backend.
- Las reglas de datos y contratos API son consistentes.
- Los requisitos originales conservan trazabilidad histórica.
- Existe un reporte de impacto sobre Features 01 y 02.
- No se modificó código ni infraestructura.
- Las decisiones pendientes están documentadas.
- Ningún documento ha sido marcado APPROVED sin mi aprobación.

---

## 11. INSTRUCCIÓN FINAL

**Ejecuta exclusivamente esta tarea de alineación documental.**

No continúes implementando las Features 01 o 02 durante esta ejecución.

No implementes el nuevo Freemium.

No cambies la infraestructura.

Al terminar, presenta el reporte de alineación y solicita mi aprobación para utilizar los nuevos Core como referencia en las siguientes fases SDD.