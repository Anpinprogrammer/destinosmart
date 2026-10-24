# TASK-016 — Propuestas de corrección de accesibilidad y resiliencia

- **feature_id:** `01-landing-page`
- **version:** `0.1.0`
- **status:** `draft`
- **date:** 2026-10-23 (America/Bogota)
- **approved_by / approved_at / approved_version:** `— / — / —`
- **authorization:** propietario: «continuemos con task-016»; preparación de propuestas según tareas aprobadas v0.2.0. No autorización de cambios visuales, implementación o publicación.

## Objetivo, entradas y resultado

Convertir hallazgos de TASK-013/014 en correcciones concretas revisables. Se revisaron spec/plan/tasks aprobados, política Prototype-First, constitución, ADR-007, evidencias JSON/PNG y fuentes de LandingPage, Navbar, TravelChatbot, Hero, LandingSection, Pricing y Contact. No se reinterpreta código existente como requisito nuevo ni se crea un rediseño.

Este documento propone cambios; **ninguno está implementado**. Completar TASK-016 significa documentar y revisar propuestas, no cerrar defectos ni aceptar AC-018/019/020/023. No se editan spec/plan aprobados ni sus aprobaciones. Los paquetes seleccionados deberán incorporarse a un alcance/plan/tareas de remediación y obtener las aprobaciones aplicables antes de ejecutar código.

## Paquete A — Comportamiento de teclado sin cambios visuales

### P16-001 — Modal de resumen accesible (prioridad alta)

- **Hallazgo:** H013-001. Foco inicial fuera del resumen, tabulación a controles de fondo y Escape sin efecto. Evidencia: `artifacts/task-013/768x1024/observations.json` y equivalente 844×390.
- **Cambio recomendado:** conservar los mismos motion.div, clases, texto y animaciones; guardar elemento disparador al abrir, enfocar el botón de cierre, contener Tab/Shift+Tab en los controles habilitados/visibles del resumen y cerrar con Escape. Restaurar foco al disparador si sigue conectado; si desapareció, al control visible que inicia la solicitud. No forzar foco en nodo eliminado ni interferir con diálogos nativos existentes.
- **Modalidad real:** impedir foco/click de fondo durante apertura, por ejemplo `inert` en los hermanos del overlay, preservando/restaurando su valor previo y sin volver inert el propio modal. Elegir el contenedor mínimo tras inspección del árbol. Limpiar listeners/atributos en cierre y desmontaje, y tolerar StrictMode. No aplicar aria-hidden a un ancestro del foco.
- **Alternativa no elegida:** sustituir por dialog nativo simplifica modalidad, pero puede alterar top-layer, backdrop y animación; requeriría caracterización visual y autorización adicional. No introducir librería modal.
- **Archivo candidato:** `src/features/landing/landing-page.tsx`; pruebas específicas del resumen en `tests/e2e/` y unidad si aporta cobertura de lifecycle.
- **Pruebas de aceptación:** apertura por Enter y click; foco inicial dentro; ciclos completos Tab/Shift+Tab sin targets de fondo; Escape y botones cierran; restauración del disparador; segundo ciclo de apertura y desmontaje no dejan inert/listeners residuales. Viewports 768×1024 y 844×390 más matriz de TASK-013. No afirmar que esto resuelve el recorte vertical de P16-003.
- **Trazabilidad:** NFR-003 / AC-019; FR-006 solo en superficie local de Landing, sin implementar Feature 03.

### P16-002 — Escape del menú (mejora opcional)

- **Hallazgo:** O013-001; menú no modal abre/cierra con Enter pero Escape no lo cierra. No se presenta como infracción de modalidad.
- **Cambio recomendado:** con menú abierto, Escape cierra y devuelve foco al toggle; aria-expanded conserva comportamiento actual. No atrapar foco en menú no modal ni cambiar anchors/layout.
- **Archivo candidato:** `Navbar.tsx` y prueba de menú; sin cambio de estilos o rutas.
- **Pruebas:** Enter abre, Escape cierra/restaura, enlace cierra y navega, desmontaje limpia listener si existe. Matriz con menú: 320/390/768/1024 px.
- **Trazabilidad:** FR-002 / AC-002 y NFR-003 / AC-019. Opcional; puede aprobarse aparte de P16-001.

## Paquete B — Ajustes visuales acotados, autorización específica requerida

### P16-003 — Resumen desplazable en poca altura

- **Hallazgo:** H013-003; en 844×390 el panel estable mide 420.25 px, de top=-15.125 a bottom=405.125.
- **Cambio propuesto:** mantener ancho, colores, fuentes, padding, posición centrada cuando cabe y animación existente; limitar altura del panel al viewport dinámico menos el espacio vertical ya reservado (p-4: total 2rem) y permitir scroll vertical dentro. No añadir breakpoint ni reducir tipografía; verificar que foco hace visible el control activo y que cierre/footer son alcanzables con teclado.
- **Archivos:** únicamente clases de altura/overflow del panel en `landing-page.tsx` y pruebas. No corrección silenciosa: cambia comportamiento de layout y requiere excepción explícita a Prototype-First para esas clases.
- **Pruebas:** contenido y cierre alcanzables en 844×390, 320×568 y 768×1024; sin scroll horizontal global ni doble bloqueo de scroll. Comprobar zoom/teclado virtual como validación adicional si el entorno lo permite, sin fingir evidencia.
- **Trazabilidad:** NFR-002/003 / AC-018/019. Ejecutar junto a P16-001 si se autoriza.

### P16-004 — Cierre del chat por encima del header

- **Hallazgo:** H013-002; en 844×390 el panel está dentro del viewport pero header tapa el centro del botón cerrar. Escape funciona.
- **Opción recomendada:** ajustar únicamente stacking del contenedor flotante mientras el chat está abierto, por encima del header actual, conservando posición/tamaño/layout y estado no modal. Revisar que no tape los diálogos modales o sus backdrops. No elegir z-index arbitrario sin comparar navbar, modal de resumen y top-layer nativo.
- **Alternativa:** limitar altura/posición del chat para que empiece debajo del header, con menos espacio de conversación; afecta más a layout. Requiere decisión si la opción de stacking no conserva jerarquía de overlays.
- **Archivo:** `TravelChatbot.tsx`; no subir globalmente Navbar ni cambiar infraestructura de portales.
- **Pruebas:** centro del cierre devuelve el propio botón por hit-test, click funciona y Escape restaura; input permanece visible; abrir un modal nativo y el resumen no deja al chat por encima de ellos. 844×390 y matriz de cinco anchos.
- **Autorización:** excepción de stacking visual localizada, sin rediseño. Trazabilidad NFR-002/003 / AC-018/019.

### P16-005 — Texto de botones naranja con contraste suficiente

- **Hallazgo:** H014-001; blanco sobre #FF9A00 = 2.1267:1 en Frecuente (14px) y contacto (16px); umbral de texto normal 4.5:1.
- **Opción recomendada:** usar el color existente `brand-primary` (#0E2C52) para texto/icono heredado de esos dos botones; conservar naranja, forma, tamaño y tipografía. Reutiliza token pero sí cambia color visible: requiere autorización expresa. No cambiar token global o todos los botones naranja.
- **Alternativa:** conservar blanco y oscurecer solo esos fondos a un token existente que alcance contraste, lo que cambia más la identidad del CTA; no recomendada frente a reutilizar texto oscuro.
- **Cálculo previo ejecutado:** relación sRGB #0E2C52 sobre #FF9A00 = **6.579:1**; sobre el hover naranja existente #ED8E00 = **5.644:1**. Python aplicó luminancia lineal y `(Lmax+.05)/(Lmin+.05)` a esos hex. Son estimaciones de colores sólidos para revisar la propuesta, no verificación de CSS aplicado ni estados focus/disabled.
- **Archivos:** `Pricing.tsx`, `Contact.tsx`; tests de contraste en estado normal y hover. Mantener copy autorizado y lógica de envío delegado.
- **Pruebas:** ratio computado >=4.5 en texto normal/hover para ambos botones; comprobar foco/iconos en contexto sin declarar cumplimiento global WCAG. Capturas desktop/móvil y diff sin modificaciones de DS.
- **Trazabilidad:** NFR-003 / AC-019. No implementar sin aprobación concreta del cambio de color.

### P16-006 — Pausar/reanudar hero sin sustituir animaciones

- **Hallazgo:** H014-002; autoplay avanza tras 6500 ms y no ofrece pausa, mientras la historia sí la tiene.
- **Propuesta:** estado de pausa y control accesible persistente dentro del área de controles existente; detener programación del siguiente slide, sin cambiar fotografías ni transición existente. Reanudar explícitamente; con reduced motion no iniciar autoplay. Un cambio manual de foto no debe reactivar la rotación pausada sin decisión explícita.
- **Diseño pendiente:** definir ubicación y tratamiento móvil, donde los controles de carrusel actuales se ocultan. Añadir control altera composición: requiere aprobación visual concreta antes de codear. No copiar librería ni rediseñar hero.
- **Archivo:** `Hero.tsx` y pruebas temporizadas con imágenes mockeadas. Validar cambio de preferencia de movimiento en ejecución y limpieza del timer.
- **Pruebas:** pausa real durante más de un intervalo; reanudar avanza; etiquetas/estado coherentes; teclado y móvil; reducido mantiene foto y no deja timers activos. No medir 60 fps por conteo de slides.
- **Trazabilidad:** FR-003 / AC-003; NFR-004 / AC-020.

## Paquete C — Recuperación de carga; decisión de arquitectura antes de código

### P16-007 — Fallo aislado de sección diferida

- **Hallazgo:** H014-003, reproducido abortando import de Pricing en Vite desarrollo; error global inglés sin retry, desaparece hero. **Producción todavía no reproducida.**
- **Paso previo recomendado:** exportar build local con placeholders y reproducir fallo de chunk en preview aislado; conservar servidor del usuario. Registrar si ocurre lo mismo antes de elegir corrección. No tocar host ni CI.
- **Propuesta si se confirma:** error boundary local alrededor del contenido de cada LandingSection para conservar navbar/hero/otras secciones; mensaje español y acción de recuperación que no simule éxito. Mantener reserva de espacio durante fallo. Alcance en `LandingSection.tsx` y, si es necesario, un componente auxiliar de error de Feature 01; sin cambiar router/auth raíz.
- **Reintento:** resetear boundary por sí solo no garantiza volver a solicitar un React.lazy rechazado. Decidir si se recrea el lazy loader de forma controlada o se ofrece recarga explícita de página. No añadir bucles automáticos/cache-busting arbitrario ni afirmar que un retry funciona sin observar otra solicitud y recuperación. La recarga debe advertir pérdida de estado local, sin inventar persistencia.
- **ADR/plan:** cambio de estrategia de error/carga requiere propuesta técnica aprobada, con ADR si se convierte en política transversal. No reconfigurar infraestructura/router para resolverlo.
- **Pruebas:** chunk fallido conserva superficie navegable; español; acción elegida recupera tras retirar mock; errores repetidos se acotan; sin llamadas de dominio y sin estado de éxito ficticio. Validar desarrollo y preview local por separado.
- **Trazabilidad:** NFR-007 / AC-023; FR-002 / AC-002 como regresión. Pendiente de autorización para implementación/arquitectura.

## Observaciones que no justifican un fix automático

- **O014-001:** foto inicial fallida no bloquea contenido; falta decidir si necesita aviso/fallback visual. Proponer copy/imagen alternativa solo con contenido y diseño aprobados; no generar assets por inferencia. Fallo de foto siguiente ya conserva la actual.
- **O014-002:** reduced motion detiene autoplay y marquee; quedan fades de opacidad y CSS smooth. No se observaron transformaciones residuales en la muestra; no eliminar animaciones globales. Caracterizar los caminos de scroll y cambios de preferencia antes de proponer corrección adicional.
- Contenido legal/testimonios/canales de publicación sigue en TASK-008/020/021; no mezclarlo con remediación de a11y ni declarar TASK-015 totalmente cerrada por estas propuestas.

## Orden recomendado y control de cambios

1. Aprobar P16-001 (foco/modalidad) y, opcionalmente, P16-002 (menú); después preparar tareas de remediación verificables para implementación explícita.
2. Seleccionar excepciones visuales P16-003/004/005; acordar propuesta visual de P16-006 antes de añadir control.
3. Caracterizar producción local y aprobar estrategia P16-007 antes de implementar error boundary/retry.

La aprobación puede ser parcial identificando IDs. **No constituye aprobación de esta propuesta por el agente** ni autorización automática para todas las opciones. Una vez elegida, actualizar/reaprobar los artefactos afectados con versión/fecha y crear tareas pequeñas (IDs nuevos, sin reutilizar TASK-016 como remediación ilimitada). Preservar fuente original de aprobaciones v0.2.0.

Cada diff futuro debe enumerar archivos y pruebas, revisar impacto sobre consumidores y pasar typecheck, pruebas del hallazgo y regresión correspondiente. Cualquier cambio de huella protegida se presenta como delta exacto para autorización, no regeneración general. No cambiar prototipo, DS, dependencias, backend ni features externas. Review independiente y aceptación G5 después de implementación/evidencia, nunca por aprobar propuestas.

## Selección aprobada por el propietario — 2026-10-23

Fuente explícita: «apruebo p16-001 y 002», en respuesta a la solicitud de aprobar P16-001/002 para preparar su plan y tareas. **P16-001 y P16-002 aprobadas como propuestas seleccionadas** por el propietario del proyecto. El documento general conserva draft porque P16-003–007 no están aprobadas. No hay autorización implícita de código, publicación o cambios visuales.

Plan y tareas de remediación preparados en v0.3.0 de los artefactos correspondientes, pendientes de G2/G3. Spec v0.2.0 sin cambios: AC-002/019 ya exigen comportamiento de teclado. No se aprueban nuevos requisitos o alteraciones de diseño por este registro.
