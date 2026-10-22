# CORE-03 — Stack tecnológico

> **Actualización 2026-10-22:** `prototipos/destinosmart-dashboard` fue eliminado intencionalmente. La app de producción en la raíz usa React + Vite + TypeScript estricto + Tailwind + Framer Motion + TanStack Router + Supabase; `prototipos/prototipo-gpt` es la única referencia visual. Las filas históricas del dashboard eliminado no son estado operativo.

- **ID:** `CORE-03`
- **Nombre:** Stack actual, dependencias y tecnologías objetivo
- **Estado:** `APPROVED`
- **Versión:** `0.2.0`
- **Fecha:** 2026-10-21
- **Fuente:** `package.json` y lockfiles de `prototipos/` y de la app raíz; `docs/tech-stack.md`; Documento Maestro v4.0, sección 6; `ADR-001`, `ADR-003`, `ADR-006`; `docs/current-architecture-audit.md`.
- **Aprobación:** aprobada por el propietario del proyecto — `approved_by: propietario del proyecto`, `approved_at: 2026-10-21`, `approved_version: 0.2.0`.
- **Objetivo:** registrar el stack realmente detectado, sus versiones verificables y las tecnologías objetivo, sin proponer migraciones como decisiones aprobadas.

## 1. Alcance

- Inventario de frameworks, librerías y herramientas presentes.
- Versiones declaradas y resueltas.
- Stack objetivo fijado por v4.0.
- Vacíos de tooling y decisiones abiertas.
- Política de cambios de dependencias.

No cubre:

- Instalación, actualización, eliminación o migración de dependencias.
- Configuración de build, hosting o CI.
- Selección de modelos de IA, proveedores o caché.

## 1.1 Restricciones

- No se instalan, eliminan ni actualizan dependencias.
- No se modifican `package.json`, lockfiles, `tsconfig`, Tailwind, PostCSS ni Vite.
- No se migra de Vite a otro framework.
- No se declara una herramienta de producción sin ADR.
- No se asumen versiones, proveedores, modelos ni hosting no verificados.
- No se incluyen secretos en manifiestos, lockfiles ni documentos.

## 2. Stack actual (IMPLEMENTADO)

### 2.1 Matriz por proyecto

| Proyecto | React | TypeScript | Vite | Tailwind | Framer Motion | Lucide |
|---|---|---|---|---|---|---|
| `prototipos/destinosmart-dashboard` | 18.3.1 | 5.9.3 | 6.4.4 | 3.4.19 | 12.43.0 | 0.468.0 |
| `prototipos/prototipo-claude` | 18.3.1 | 5.9.3 | 5.4.21 | 3.4.19 | 11.18.2 | 0.453.0 |
| `prototipos/prototipo-gpt` | 18.3.1 | 5.7.3 | 6.4.4 | 3.4.19 | 11.18.2 | 0.468.0 |

> Versiones resueltas tomadas de `package-lock.json`. No se ejecutó instalación, build ni actualización durante esta alineación.

### 2.2 Aplicación raíz (IMPLEMENTADO)

La app nueva de producción vive en la raíz del repositorio (`ADR-003`) y añade `package.json`, `package-lock.json`, `src/`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `vercel.json`, tests y scripts.

| Tecnología | Versión resuelta | Evidencia |
|---|---|---|
| React | 18.3.1 | `package-lock.json` |
| TypeScript | 5.9.3 | `package-lock.json` |
| Vite | 6.4.4 | `package-lock.json` |
| TanStack Router | 1.170.45 | `package-lock.json` |
| Tailwind CSS | 3.4.19 | `package-lock.json` |
| Framer Motion | 12.43.0 | `package-lock.json` |
| `@supabase/supabase-js` | 2.118.0 | `package-lock.json` |
| Vitest | 5.0.5 | `package-lock.json` |
| Playwright | 1.64.1 | `package-lock.json` |
| Node | `>=24.0.0` | `package.json` `engines` |

**Estado:** Vite, TanStack Router y Vercel están autorizados por `ADR-003` para la app nueva. No se aplican a los prototipos existentes.

### 2.2 Dependencias declaradas

| Proyecto | Dependencias | DevDependencies |
|---|---|---|
| Dashboard | `framer-motion`, `lucide-react`, `react`, `react-dom` | `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `autoprefixer`, `postcss`, `tailwindcss`, `typescript`, `vite` |
| Claude | `framer-motion`, `lucide-react`, `react`, `react-dom` | `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `autoprefixer`, `postcss`, `tailwindcss`, `typescript`, `vite` |
| GPT | `framer-motion`, `lucide-react`, `react`, `react-dom` | `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `autoprefixer`, `postcss`, `tailwindcss`, `typescript`, `vite` |

### 2.3 Configuraciones

| Proyecto | `tsconfig` | `tailwind` | `postcss` | `vite` |
|---|---|---|---|---|
| Dashboard | `strict`, `noUnusedLocals`, `noUnusedParameters`, `moduleResolution: Bundler` | `tailwind.config.ts` | `postcss.config.cjs` | `vite.config.ts` |
| Claude | `strict`, `moduleResolution: bundler` | `tailwind.config.ts` | `postcss.config.js` | `vite.config.ts` |
| GPT | `strict` en `tsconfig.app.json`, `noUnusedLocals`, `noUnusedParameters` | `tailwind.config.js` | `postcss.config.js` | `vite.config.ts` |

### 2.4 Herramientas por superficie

| Herramienta | Prototipos | App raíz | Implicación |
|---|---|---|---|
| Router | **NO EXISTE** | **TanStack Router 1.170.45** | Producción usa TanStack; prototipos siguen sin router. |
| Cliente Supabase | **NO EXISTE** | **`@supabase/supabase-js` 2.118.0** | Cliente/validación en `src/lib`; auth/UI pendientes. |
| Cliente OpenRouter | **NO EXISTE** | **NO EXISTE** | Sin IA. |
| Data fetching/estado global | **NO EXISTE** | Contexto/loaders; sin TanStack Query | Sin capa global adicional. |
| Test runner | **NO EXISTE** | **Vitest 5.0.5 / Playwright 1.64.1** | `npm run test` / `test:e2e`. |
| Lint/formatter | **NO EXISTE** | **NO EXISTE** | Pendiente. |
| CI/CD | **NO EXISTE** | Vercel propuesto; sin pipeline | Pendiente. |
| Monorepo/workspace | **NO EXISTE** | App raíz + prototipos separados | No hay workspace. |
| Variables de entorno | **NO EXISTE** | `.env.example`; sin `.env` real | Configuración por entorno. |
| Observabilidad | **NO EXISTE** | **NO EXISTE** | Pendiente. |

## 3. Stack objetivo (DOCUMENTADO)

Fijado por el Documento Maestro v4.0 y `docs/tech-stack.md`:

| Capa | Tecnología objetivo | Estado |
|---|---|---|
| Web | React.js + TypeScript estricto | **DOCUMENTADO** |
| UI | Tailwind CSS | **DOCUMENTADO** |
| Movimiento | Framer Motion | **DOCUMENTADO** |
| Persistencia/BaaS | Supabase PostgreSQL, Auth, Realtime, Storage, RLS | **DOCUMENTADO** |
| Backend | Supabase Edge Functions (Deno/TypeScript) | **DOCUMENTADO** |
| IA | OpenRouter API | **DOCUMENTADO** |
| Caché | Supabase Database / Redis | **PENDIENTE** (`DQ-13`) |

### 3.1 Tecnologías explícitamente no decididas

No se asumen como decisiones aprobadas:

- Cambios de bundler o migración de Vite en la app raíz.
- Cambios de TanStack Router o migración a otro router.
- Cambios de hosting (Vercel es la referencia aprobada; previews/pipeline pendientes).
- ORM o capa de acceso a datos.
- Gestor de paquetes/workspace distinto del actual.
- Lint/formateo y CI/CD concretos.
- Proveedor de imágenes, vuelos, hospedaje, mapas o pagos.
- Modelos de IA concretos.
- Redis u otra caché.
- País, idiomas, monedas o FX.
- Cuotas de uso de IA de planes pagos.

## 4. Versiones y compatibilidad

### 4.1 Estado actual

- React 18.3.1 es común a los tres prototipos y a la app raíz.
- Vite: 5.4.21 en Claude; 6.4.4 en GPT, dashboard y app raíz.
- Framer Motion: 11.18.2 en Claude/GPT; 12.43.0 en dashboard y app raíz.
- TypeScript: 5.7.3 en GPT; 5.9.3 en Claude, dashboard y app raíz.
- Tailwind 3.4.19 en los cuatro proyectos.
- Lucide 0.453.0/0.468.0 solo en prototipos.
- TanStack Router 1.170.45 y Supabase JS 2.118.0 solo en la app raíz.

### 4.2 Política propuesta (PROPUESTO)

1. **No actualizar dependencias en esta fase.**
2. Toda actualización requiere ADR, evaluación de impacto y pruebas de regresión.
3. Las versiones de producción deben fijarse con lockfile y política de pinning.
4. No mezclar versiones mayores de React, Tailwind o Framer en una misma app.
5. Evitar dependencias nuevas si una solución nativa o existente cubre el caso.
6. Revisar licencias y seguridad antes de incorporar un paquete.
7. No añadir SDKs de proveedores dentro del dominio; usar adaptadores.

## 5. Tooling de calidad

| Necesidad | Herramienta | Estado |
|---|---|---|
| Typecheck | `tsc --noEmit` | **DISPONIBLE** en los tres prototipos. |
| Build | `vite build` / `tsc -b && vite build` | **DISPONIBLE** como scripts; **NO VERIFICADO**. |
| Tests unitarios | Por definir | **PENDIENTE** |
| Tests de integración | Por definir | **PENDIENTE** |
| Tests e2e | Por definir | **PENDIENTE** |
| Lint | Por definir | **PENDIENTE** |
| Formato | Por definir | **PENDIENTE** |
| Contratos de IA | Por definir | **PENDIENTE** |
| Seguridad | Por definir | **PENDIENTE** |

No se instalarán herramientas hasta que exista una tarea autorizada.

## 6. Seguridad de la cadena de suministro

- No hay secretos en `package.json` ni lockfiles.
- No se deben añadir dependencias con scripts de instalación no revisados.
- Los lockfiles deben versionarse si se autoriza Git.
- `node_modules` no debe versionarse.
- Los paquetes deben tener mantenimiento y licencia compatible.
- Los SDKs de Supabase/OpenRouter deben ejecutarse en servidor cuando manejen secretos.

## 7. Requisitos

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-03-FR-001` | La documentación debe distinguir stack de prototipos y stack de producción. | Instrucción del propietario |
| `CORE-03-FR-002` | Las versiones declaradas y resueltas deben ser verificables en manifiestos/lockfiles. | RNF-01 |
| `CORE-03-FR-003` | No se añadirán dependencias sin ADR y tarea autorizada. | Constitución |
| `CORE-03-FR-004` | El stack objetivo debe respetar React/TS/Tailwind/Framer/Supabase/Edge/OpenRouter. | v4.0 |
| `CORE-03-FR-005` | Las decisiones de bundler, routing, hosting, caché y proveedores deben quedar abiertas hasta su ADR. | `DQ-01`, `DQ-13` |
| `CORE-03-FR-006` | Los secretos deben permanecer fuera del cliente y de los manifiestos. | RNF-04 |
| `CORE-03-FR-007` | Documentar TanStack Router, Vite y Supabase JS como tecnologías detectadas de la app raíz, sin asumir que aplican a los prototipos. | ADR-003 |
| `CORE-03-FR-008` | No migrar los prototipos a TanStack/Vite 6 ni cambiar sus dependencias. | Instrucción del propietario |

### No funcionales

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-03-NFR-001` | TypeScript estricto sin `any` injustificados. | RNF-01 |
| `CORE-03-NFR-002` | Dependencias compatibles y sin duplicación innecesaria. | Mantenibilidad |
| `CORE-03-NFR-003` | Build reproducible con lockfile. | Calidad |
| `CORE-03-NFR-004` | Actualizaciones con análisis de impacto. | Constitución |

## 8. Criterios de aceptación

### `CORE-03-AC-001` → `CORE-03-FR-001`
- **Given** una spec o plan nuevo,
- **When** menciona una tecnología,
- **Then** indica si es actual, objetivo o propuesta, y cita la fuente.

### `CORE-03-AC-002` → `CORE-03-FR-002`
- **Given** una dependencia declarada,
- **When** se audita el stack,
- **Then** existe una versión resoluble en el lockfile correspondiente.

### `CORE-03-AC-003` → `CORE-03-FR-003`
- **Given** una propuesta de nueva dependencia,
- **When** no tiene ADR,
- **Then** no se implementa.

### `CORE-03-AC-004` → `CORE-03-FR-004`
- **Given** el stack objetivo,
- **When** se compara con v4.0,
- **Then** las tecnologías fijadas coinciden y las no fijadas están marcadas como pendientes.

### `CORE-03-AC-005` → `CORE-03-FR-005`
- **Given** una decisión de Vite, router, hosting o caché,
- **When** se documenta como aprobada,
- **Then** existe un ADR con contexto, alternativas y consecuencias.

### `CORE-03-AC-006` → `CORE-03-FR-006`
- **Given** el repositorio,
- **When** se busca un secreto,
- **Then** no hay claves reales en código, manifiestos, lockfiles ni documentación.

### `CORE-03-AC-007` → `CORE-03-FR-007`
- **Given** el `package-lock.json` raíz,
- **When** se audita,
- **Then** TanStack Router, Vite y Supabase JS aparecen con versiones resueltas y se distinguen de los prototipos.

### `CORE-03-AC-008` → `CORE-03-FR-008`
- **Given** los prototipos,
- **When** se revisa el diff,
- **Then** no se migraron a TanStack ni cambiaron sus dependencias.

### `CORE-03-AC-007` → `CORE-03-NFR-001`
- **Given** el código TypeScript,
- **When** se ejecuta el typecheck,
- **Then** no hay errores y no existen `any` injustificados.

### `CORE-03-AC-008` → `CORE-03-NFR-003`
- **Given** una instalación limpia con lockfile,
- **When** se ejecuta el build,
- **Then** el resultado es reproducible y no requiere dependencias no declaradas.

## 8.1 Matriz de cobertura FR/NFR → AC

| Requisito | AC | Estado |
|---|---|---|
| `CORE-03-FR-001` | `CORE-03-AC-001` | Cubierto |
| `CORE-03-FR-002` | `CORE-03-AC-002` | Cubierto |
| `CORE-03-FR-003` | `CORE-03-AC-003` | Cubierto |
| `CORE-03-FR-004` | `CORE-03-AC-004` | Cubierto |
| `CORE-03-FR-005` | `CORE-03-AC-005` | Cubierto |
| `CORE-03-FR-006` | `CORE-03-AC-006` | Cubierto |
| `CORE-03-FR-007` | `CORE-03-AC-007` | Cubierto |
| `CORE-03-FR-008` | `CORE-03-AC-008` | Cubierto |
| `CORE-03-NFR-001` | `CORE-03-AC-007` | Cubierto por typecheck. |
| `CORE-03-NFR-002` | `CORE-03-AC-002`, `CORE-03-AC-003` | **Parcial**: compatibilidad/duplicación no automatizada. |
| `CORE-03-NFR-003` | `CORE-03-AC-008` | Cubierto por build reproducible. |
| `CORE-03-NFR-004` | `CORE-03-AC-003`, `CORE-03-AC-005` | **Parcial**: análisis de impacto por ADR, no automatizado. |

## 9. Dependencias

- `CORE-02`, `CORE-05`, `CORE-07`, `CORE-08`, `CORE-09`, `CORE-10`.
- `DQ-01`, `DQ-13`, `DQ-19`.

## 10. Riesgos

| ID | Riesgo | Impacto | Mitigación propuesta |
|---|---|---|---|
| `CORE-03-RISK-001` | Cambiar Vite/TanStack o migrar prototipos sin ADR. | Alto | Mantener ADR-003 y no tocar prototipos. |
| `CORE-03-RISK-002` | Divergencia de versiones entre prototipos. | Medio | Baseline y ADR antes de integrar. |
| `CORE-03-RISK-003` | Dependencias sin mantenimiento o licencias incompatibles. | Medio | Revisión previa. |
| `CORE-03-RISK-004` | Secretos filtrados en el cliente. | Alto | `service_role` y OpenRouter solo en servidor. |
| `CORE-03-RISK-005` | Actualizaciones automáticas que rompen los prototipos. | Alto | Pinning y pruebas de regresión. |
| `CORE-03-RISK-006` | Falta de tests/lint/CI. | Alto | Implementar en fase autorizada. |

## 11. Decisiones pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| `CORE-03-DQ-001` | Bundler y routing de producción (`DQ-01`). | Scaffold. |
| `CORE-03-DQ-002` | Hosting y CI/CD. | Despliegue. |
| `CORE-03-DQ-003` | Caché DB/Redis (`DQ-13`). | Ofertas. |
| `CORE-03-DQ-004` | Proveedores externos (`DQ-09`). | Integraciones. |
| `CORE-03-DQ-005` | Modelos OpenRouter (`DQ-19`). | IA. |
| `CORE-03-DQ-006` | Herramientas de test/lint. | Calidad. |
| `CORE-03-DQ-007` | Actualización de Tailwind/PostCSS y pinning exacto de dependencias. | Seguridad/reproducibilidad. |

## 12. Referencias

- `prototipos/*/package.json`
- `prototipos/*/package-lock.json`
- `prototipos/*/tsconfig*.json`
- `prototipos/*/tailwind.config.*`
- `prototipos/*/vite.config.ts`
- `docs/tech-stack.md`
- `docs/decisions/ADR-001-mvp-stack.md`
- `docs/current-architecture-audit.md`
- `DestinoSmart v4.0.pdf` — sección 6.
