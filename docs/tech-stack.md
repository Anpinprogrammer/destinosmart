# Stack del MVP — establecido por fuente v4.0

**Estado:** establecido como requisito de arquitectura del documento maestro; versiones y opciones no resueltas quedan abiertas.

| Capa | Tecnología de la fuente | Criterio para el harness |
|---|---|---|
| Web | React.js + TypeScript estricto | Typecheck sin `any` injustificados; definir herramienta de build y routing por ADR |
| UI | Tailwind CSS | Componentes mobile-first, semánticos y accesibles |
| Movimiento | Framer Motion | Animaciones respetuosas con `prefers-reduced-motion`; medir carga y fluidez |
| Persistencia/BaaS | Supabase PostgreSQL, Auth, Realtime, Storage, RLS | Migraciones versionadas, políticas RLS y tests de acceso por rol/tenant |
| Backend | Supabase Edge Functions (Deno/TypeScript) | Validación de requests, Auth, secretos server-side, CORS y rate limiting |
| IA | OpenRouter API | Llamadas solamente server-side desde funciones; outputs validados, límites y costos observables |
| Caché | Supabase Database / Redis | **Alternativa abierta:** no elegir Redis ni añadir dependencia sin ADR |

## Restricciones y decisiones abiertas
- No asumir Vite, Next.js, React Router, un ORM, gestor de paquetes, librerías de test, CI o hosting web sin definición en plan/ADR.
- No inventar estructuras de tablas, edge functions ejecutables ni modelos IA obligatorios. Crear contratos primero.
- Proteger keys de OpenRouter y Supabase service_role; anon/public key solo con RLS correcto, sin confundirla con una credencial de servidor.
- Las ofertas de destinos: datos e imágenes con atribución/licencias según API, caché y períodos de refresco precisados en v4.0; políticas de fallos y costos pendientes.
- Frontend debe mostrar estados loading, stale, retry, error y success; performance medido con escenarios y percentiles.
