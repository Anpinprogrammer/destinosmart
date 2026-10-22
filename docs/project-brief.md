# DestinoSmart — visión y requisitos (fuente v4.0)

**Fuente:** Documento Maestro de Visión y Requerimientos del Proyecto, versión 4.0, seis páginas. Este documento resume requisitos; no autoriza implementación sin specs y aprobaciones.

## Visión
Plataforma SaaS mobile-first que reúna exploración del destino, clima, vuelos, alojamientos, presupuestos, itinerarios, reservas y acompañamiento. Formulario único con origen, destino, fechas tentativas, pasajeros, módulos de servicios y presupuesto opcional.

## Experiencia pública y privada
- Landing: header con idioma/moneda/auth; hero de destinos con carrusel animado; formulario; seis cards de rutas económicas con fotografías reales provenientes de APIs de imágenes y caché; precios/trial; historia; testimonios; alianzas; footer.
- Ofertas: cron de refresco cada seis horas, botón «Actualizar Ofertas» con máximo una activación cada quince minutos por usuario, tratamiento de errores, frescura visible y protección contra abuso (contratos por definir).
- Dashboard: viajes guardados/editables, exportación PDF, reservas integradas, chat contextual y notificaciones.

## Monetización descrita
Free: 3 presupuestos/día sin cuenta, vista previa del día 1, afiliados y PDF; guardado de hasta 10 con cuenta según tabla (interpretación exacta pendiente). Ocasional: USD 2/mes, 15 presupuestos/día, 5 itinerarios/mes y alertas de vuelos. Frecuente: USD 5/mes, presupuesto «40 por día / ilimitado» ambiguo, itinerarios reeditables ilimitados, alertas de vuelos/hospedaje/atracciones y chat. Trial de 14 días: condiciones pendientes.

## Arquitectura de PRODUCTO (a especificar más adelante)
Orquestador con OpenRouter; futuros roles de presupuesto, itinerarios, tendencias, acompañante y reservas. La fuente enumera candidatos: router Gemini 2.0 Flash o GPT-4o-mini; presupuesto/itinerario Claude 3.5 Sonnet; tendencias DeepSeek V3 o Gemini 2.0 Flash; chat Gemini 2.0 Flash; reservas GPT-4o. Son **referencias históricas de la v4.0, no disponibilidad verificada ni selección automática**. Antes de implementar, verificar catálogo de modelos, precios, soporte y rendimiento.

## Stack del MVP
Consultar `docs/tech-stack.md`. Fuente: React/TS estricto, Tailwind, Framer Motion, Supabase y Edge Functions Deno/TS, OpenRouter; opción Database/Redis para caché.

## Requisitos oficiales
Consultar `docs/requirements-traceability.md` para RF-01 a RF-08 y RNF-01 a RNF-05. La v4.0 no incluye como RF explícito separado el monitoreo de alertas que sí aparecía en v3.0; permanece en visión/dashboard/tabla de planes y requiere aclaración de alcance.

## Advertencias
Precio generado por IA no equivale a precio exacto confirmado; un modelo no realiza conversiones financieras fiables sin datos y cálculo determinista. Objetivos 60 fps, 6 segundos y 99,5% exigen definición de método y medición. La mención de Stripe no implica integración autorizada ni cumplimiento PCI-DSS automático.
