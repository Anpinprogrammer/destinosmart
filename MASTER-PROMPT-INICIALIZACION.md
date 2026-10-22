MASTER PROMPT — Inicialización de Especificaciones Globales SDD
Actúa como un Staff Software Architect, Senior Software Engineer y experto en Spec-Driven Development (SDD).
Estamos desarrollando DestinoSmart, una plataforma SaaS de planificación inteligente de viajes basada en el documento maestro de requerimientos versión 4.0.
Tu objetivo es analizar el repositorio existente y construir las especificaciones globales del proyecto, utilizando exclusivamente el harness SDD y los comandos que ya están definidos.
IMPORTANTE: ESTA TAREA ES EXCLUSIVAMENTE DOCUMENTAL. NO DEBES IMPLEMENTAR, MODIFICAR NI REFACTORIZAR CÓDIGO.

1. Contexto del proyecto
El proyecto contempla:
Plataforma SaaS responsive y mobile-first.
Landing page pública.
Dashboard privado.
Formulario inteligente de planificación de viajes.
Generación de presupuestos e itinerarios mediante IA.
Integración futura con OpenRouter y un sistema multiagente.
Gestión de usuarios, suscripciones y límites de consumo.
Ofertas de viajes dinámicas.
Exportación de itinerarios a PDF.
Reservas y pagos integrados en fases posteriores.
Utiliza como fuente principal el documento maestro DestinoSmart v4.0, siempre que esté disponible en el repositorio.
No inventes requisitos no contemplados en la documentación. Si necesitas proponer requisitos adicionales, identifícalos como propuestas pendientes de aprobación.
2. REGLA CRÍTICA: PROTECCIÓN DE LA INFRAESTRUCTURA EXISTENTE
El repositorio ya contiene prototipos funcionales o parcialmente funcionales de:
Un Design System.
Una Landing Page.
Uno o varios paneles administrativos.
Estos prototipos representan trabajo previamente realizado y deben conservarse.
PROHIBICIONES ABSOLUTAS
Sin autorización explícita del propietario del proyecto, NO puedes:
Cambiar frameworks o librerías existentes.
Migrar proyectos entre Vite, Next.js u otros frameworks.
Cambiar el sistema de routing.
Modificar la estructura de carpetas existente.
Refactorizar componentes actuales.
Reemplazar el Design System existente.
Modificar colores, tipografías, tokens, componentes o animaciones.
Reemplazar Tailwind CSS, librerías UI o librerías de iconos.
Instalar, eliminar o actualizar dependencias.
Modificar archivos package.json, lockfiles o configuraciones.
Eliminar archivos o funcionalidades existentes.
Reescribir la Landing Page o los dashboards.
Crear una nueva infraestructura que duplique la existente.
Ejecutar migraciones o realizar modificaciones a servicios externos.
Si detectas que la arquitectura actual difiere del documento maestro, NO la modifiques.
Documenta la diferencia, explica sus implicaciones y solicita una decisión.
La documentación debe describir fielmente la implementación existente y distinguirla de la arquitectura objetivo.
3. Orden de prioridad de las fuentes
Al crear las especificaciones, utiliza este criterio:
Instrucciones explícitas del propietario del proyecto.
Constitución SDD (docs/constitution.md) y reglas del harness que no entren en conflicto con estas instrucciones.
Código, configuraciones y estructura real del repositorio para documentar el estado actual.
Documento Maestro DestinoSmart v4.0 para los requisitos y arquitectura objetivo.
Propuestas arquitectónicas nuevas, únicamente como recomendaciones pendientes.
Si encuentras contradicciones, no elijas silenciosamente una alternativa.
Regístralas y solicita aprobación cuando afecten decisiones importantes.
4. Inspección inicial obligatoria
Antes de escribir cualquier especificación:
Lee AGENTS.md.
Lee MEMORY.md.
Lee docs/constitution.md.
Revisa el harness en .agents/ y .opencode/commands/.
Revisa las especificaciones existentes, si las hay.
Analiza la estructura general del repositorio.
Identifica los proyectos frontend existentes.
Identifica sus frameworks, dependencias y configuraciones.
Localiza el Design System y sus componentes.
Identifica las vistas existentes de Landing Page y dashboards.
Determina qué partes de la aplicación ya están implementadas.
Identifica tecnologías mencionadas en el documento maestro pero todavía no integradas.
Realiza una inspección read-only. No ejecutes comandos que modifiquen archivos o dependencias.
No supongas que un prototipo utiliza una tecnología determinada: compruébalo en el repositorio.
5. Entregable previo: reporte de descubrimiento
Genera el siguiente documento:
docs/current-architecture-audit.md
Debe contener:
Estructura actual del repositorio.
Frameworks y herramientas detectadas.
Dependencias principales.
Design System identificado.
Componentes reutilizables existentes.
Páginas y layouts construidos.
Configuración actual de routing.
Estado de Supabase, si existe.
Estado de OpenRouter, si existe.
Infraestructura reutilizable.
Diferencias entre implementación actual y arquitectura objetivo.
Riesgos y decisiones pendientes.
Distingue explícitamente:
IMPLEMENTADO: comprobado en el código.
DOCUMENTADO: definido en la documentación.
PROPUESTO: recomendación del agente.
PENDIENTE: requiere decisión o implementación.
NO VERIFICADO: sin evidencia suficiente.
Presenta el reporte y espera mi aprobación antes de comenzar las especificaciones globales.
6. Especificaciones globales que debes generar
Después de mi aprobación, utiliza los comandos SDD apropiados para crear:
specs/core/01-product-overview.md
Incluye visión, propuesta de valor, tipos de usuarios, funcionalidades, objetivos, alcance y exclusiones del MVP.
specs/core/02-system-architecture.md
Documenta la arquitectura actual y la arquitectura objetivo, delimitación de responsabilidades, componentes, flujos de información y decisiones pendientes. Conserva la infraestructura existente.
specs/core/03-tech-stack.md
Registra el stack detectado, versiones verificables, dependencias actuales y tecnologías objetivo. No propongas migraciones como decisiones aprobadas.
specs/core/04-database-design.md
Define un modelo conceptual preliminar para usuarios, viajes, presupuestos, itinerarios, suscripciones, ofertas y reservas. Especifica relaciones, restricciones y necesidades de RLS, sin crear tablas ni migraciones.
specs/core/05-auth-security.md
Define los requisitos de autenticación, autorización, protección de información, manejo de secretos, control de consumo y requisitos de seguridad financiera.
specs/core/06-design-system.md
Documenta exclusivamente el Design System existente.
Identifica tokens, tipografías, colores, componentes, variantes, espaciados, animaciones, responsive y patrones de composición.
No rediseñes ni sustituyas componentes.
Cuando no puedas verificar un elemento, indícalo en lugar de inventarlo.
specs/core/07-api-contracts.md
Define contratos conceptuales para frontend, Supabase Edge Functions, OpenRouter y APIs externas.
Incluye estructuras propuestas de entrada y salida, validación, autenticación, errores, idempotencia y versionado.
Identifica todo contrato todavía no aprobado.
specs/core/08-ai-architecture.md
Define exclusivamente las especificaciones arquitectónicas para la futura integración multiagente.
Incluye responsabilidades, contratos JSON, estrategias de orquestación, manejo de errores, límites de consumo, seguridad y observabilidad.
NO implementes ni configures agentes de IA del producto.
No confundas los agentes funcionales de DestinoSmart con los agentes del harness SDD.
specs/core/09-testing-strategy.md
Define pruebas unitarias, integración, end-to-end, seguridad, componentes UI, contratos de IA, regresión y criterios de aceptación.
Prioriza la protección contra cambios no deseados en los prototipos existentes.
specs/core/10-observability-performance.md
Documenta objetivos de rendimiento, medición de latencia, métricas, logs, tracing, caché, monitoreo y disponibilidad.
Incluye los objetivos de 6 segundos y 99,5 % indicados en el documento maestro, identificando las condiciones necesarias para verificarlos.
7. Convenciones obligatorias de las especificaciones
Cada archivo debe contener:
Identificador y nombre.
Estado: DRAFT / IN_REVIEW / APPROVED.
Versión.
Fuente de información.
Objetivo.
Alcance.
Requisitos aplicables.
Arquitectura o comportamiento especificado.
Restricciones.
Criterios de aceptación verificables.
Dependencias.
Riesgos.
Decisiones pendientes.
Referencias a los archivos relevantes del repositorio.
No marques ninguna especificación como APPROVED sin mi autorización.
Utiliza Markdown claro, preciso y estructurado.
8. Uso del harness SDD
Utiliza los agentes existentes:
coordinator: coordinación del proceso y aprobaciones.
planner: descubrimiento, análisis y especificaciones.
reviewer: validación de calidad y consistencia.
implementer: NO debe intervenir en esta etapa.
Utiliza los comandos pertinentes ya definidos en .opencode/commands/, respetando su funcionamiento real.
Si un comando no puede ejecutarse con seguridad o no admite especificaciones globales, no improvises su comportamiento. Documenta la limitación y solicita autorización antes de modificar el harness.
No ejecutes /sdd-implement.
No generes tareas de implementación todavía, salvo que expresamente lo solicite.
9. Validación final
Cuando hayas generado las diez especificaciones, el agente reviewer deberá comprobar:
Coherencia con DestinoSmart v4.0.
Consistencia entre las diez especificaciones.
Preservación de la arquitectura de los prototipos.
Ausencia de migraciones no autorizadas.
Ausencia de tecnologías inventadas como decisiones.
Trazabilidad con los requisitos funcionales y no funcionales.
Criterios de aceptación verificables.
Claridad de decisiones pendientes.
Ausencia de contradicciones entre documentos.
Que ningún archivo de aplicación haya sido modificado.
Entrega un reporte de hallazgos de revisión.
10. Restricciones de ejecución
Esta tarea autoriza únicamente:
Leer archivos.
Inspeccionar el repositorio.
Crear o actualizar documentación Markdown dentro de docs/ y specs/core/, conforme a las etapas aprobadas.
No está autorizado modificar:
src/
app/
components/
pages/
public/
assets/
supabase/
Archivos de configuración.
Archivos de dependencias.
Archivos de infraestructura.
El Design System.
Los prototipos existentes.
Tampoco debes modificar AGENTS.md, MEMORY.md, los comandos ni los agentes SDD sin aprobación explícita.
Si necesitas hacerlo, solicítalo primero.
11. Instrucción de inicio
Comienza exclusivamente por la inspección del repositorio y la generación de:
docs/current-architecture-audit.md
Después presenta:
Un resumen de lo encontrado.
Las diferencias con el documento maestro.
Los riesgos.
Las decisiones que necesito tomar.
DETENTE Y ESPERA MI APROBACIÓN.
No comiences la generación de las diez especificaciones globales hasta recibir autorización expresa.
