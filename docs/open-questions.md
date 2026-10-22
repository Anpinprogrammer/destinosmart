# Decisiones abiertas después de v4.0 y del modelo Freemium

La v4.0 **resuelve la selección del stack principal** y el modelo Freemium aprobado sustituye su monetización anterior. No reabrir el stack ni el modelo Free/Pro sin una nueva decisión. El resto requiere aclaración antes de las features afectadas.

> **Sustitución:** el trial de 14 días, los precios USD 2/USD 5 y las cuotas diarias 3/15/40 quedan reemplazados por `BR-FREE-001` a `BR-FREE-010`. Las filas DQ-06/DQ-07 se conservan como historia, no como requisitos vigentes.

| ID | Pregunta pendiente | Bloquea |
|---|---|---|
| DQ-01 | ¿CI, gestor de paquetes, lint y pipeline? Vite/TanStack/Vercel ya están aprobados para la app raíz (`ADR-003`). | Calidad/despliegue |
| DQ-02 | ¿Secuencia de entrega de Free/Pro, reservas/chat/alertas y checkout? | Roadmap |
| DQ-03 | ¿Países, idiomas, monedas, fuente de FX y reglas de redondeo? | Presupuestos y UI |
| DQ-04 | ¿Los importes son estimaciones, ofertas verificadas o cotizaciones firmes? ¿TTL? | Presupuestos y reservas |
| DQ-05 | ¿Acceso anónimo y antiabuso? El crédito Free es 1 viaje; no hay cuota diaria. | Auth y límites |
| DQ-06 | **SUSTITUIDA** — el trial de 14 días ya no existe. Ver `BR-FREE-004` (Pro 30 días del primer viaje). | Historia |
| DQ-07 | **SUSTITUIDA** — planes pagos con viajes ilimitados y cuotas IA pendientes. Ver `BR-FREE-008`. | Historia |
| DQ-08 | ¿Reset/atomicidad de cuotas de IA y períodos? | Quotas |
| DQ-09 | ¿Proveedores reales con APIs comerciales autorizadas para vuelos, hoteles, fotos y actividades? | Integraciones |
| DQ-10 | ¿Merchant of record, reembolsos, chargebacks, validaciones y alcance PCI? | Checkout |
| DQ-11 | ¿Cómo medir 6 s, 60 fps y 99,5 %: percentiles, pruebas, SLI, degradación? | NFR |
| DQ-12 | ¿Origen geográfico/contexto de las seis rutas y refresh global o por usuario? ¿Qué se cuenta como consulta de actualización? | Ofertas |
| DQ-13 | ¿Supabase DB, Redis o estrategia híbrida para caché? Política TTL, stale y fallos de cron. | Cache |
| DQ-14 | ¿Derechos/atribución y gestión de fotos de Unsplash, Pexels o Places? | Imágenes |
| DQ-15 | ¿Qué mecanismo programará el cron de seis horas y cómo se controla el refresh de 15 minutos de forma concurrente? | Ofertas |
| DQ-16 | ¿La autenticación es obligatoria para refresco manual? ¿Cómo limitar solicitudes anónimas por usuario? | Ofertas |
| DQ-17 | ¿Región Supabase, política de retención, PDFs y requisitos de privacidad aplicables? | Datos |
| DQ-18 | ¿Se incluyen alertas de precios en el MVP? El entitlement Pro las incluye; entrega pendiente. | Alertas |
| DQ-19 | ¿Versiones/modelos OpenRouter disponibles y política de selección/fallback? | Agentes PRODUCTO futuros |
| DQ-20 | ¿Qué versión de OpenCode, rutas de agentes/skills y permisos reales? | Harness runtime |
| DQ-21 | ¿Fuente de mapas, optimización de trayectos y semántica del tiempo real? | Itinerarios |
| DQ-22 | ¿Cuotas de uso de IA de los planes Ocasional USD 4.99 y Frecuente USD 9.99? | Billing/IA |
| DQ-23 | ¿Momento exacto de pérdida de derechos premium al cancelar una suscripción? | Suscripciones |
| DQ-24 | ¿Condiciones de checkout, upgrade durante el Pro gratuito y downgrade? | Billing |
| DQ-25 | ¿Retención de PDFs/reservas después de vencer o cancelar? | Datos/UX |

## Resolución
Documentar respuesta, decisor, fecha, referencia y estado en ADR o `clarifications.md`. Nunca tratar una pregunta sin resolver como respuesta implícita.
