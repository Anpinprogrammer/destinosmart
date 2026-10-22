# ADR-001 — Ecosistema tecnológico del MVP

- **Estado:** fuente explícita v4.0; pendiente de ratificación en constitución del repositorio
- **Fecha de registro:** 2026-10-20
- **Origen:** Documento Maestro v4.0, sección 6.

## Decisión recogida
React.js con TypeScript estricto, Tailwind CSS y Framer Motion para frontend; Supabase (PostgreSQL/Auth/Realtime/Storage/RLS), Edge Functions en Deno/TypeScript y OpenRouter para backend/IA.

## Fuera del alcance de esta decisión
Versiones, framework de bundling/routing, despliegue frontend, caché Database vs Redis, proveedor de vuelos/imágenes/pagos y modelos operativos concretos.

## Consecuencias
Los planes deberán documentar esquemas RLS, boundaries de Edge Functions, protección de secretos, contratos tipados y optimización responsive. Cambios transversales requieren nuevo ADR y aceptación humana.
