# Feature 02 — Autenticación y usuarios | Especificación funcional

- **feature_id:** `02-authentication`
- **version:** `0.2.0`
- **status:** `approved`
- **approved_by:** `propietario del proyecto`
- **approved_at:** `2026-10-21`
- **approved_version:** `0.2.0`
- **source:** Documento Maestro DestinoSmart v4.0, §§3.1, 3.2, 4, 6 y 7 (`RF-08`, `RNF-01`, `RNF-04`; soporte transversal a `RF-02`, `RF-03`, `RF-05`, `RF-07`); reglas Freemium `BR-FREE-001` a `BR-FREE-010`; `CORE-01`, `CORE-02`, `CORE-04`, `CORE-05`, `CORE-07`, `CORE-09` y `CORE-10` aprobados v0.2.0 (2026-10-21).
- **scope note:** especificación aprobada v0.2.0 basada en v4.0 y en el modelo Freemium; no implica que estos flujos ya existan en los prototipos.

## 1. Problema y resultado esperado

La nueva app ofrecerá entrada de inicio de sesión y registro; el producto dispondrá de un área privada con viajes guardados, reservas, alertas y servicios restringidos por plan. Esta feature establece la identidad, sesión y separación de acceso para que cada usuario acceda solamente a los recursos autorizados. La fuente v4.0 **sí** define Supabase Auth, PostgreSQL y RLS, pero **no** especifica proveedores de login, recuperación de contraseña ni detalles del ciclo de vida de la cuenta.

**Resultado observable:** acceso público a la landing; alta e inicio de sesión con Email/Password o Google OAuth; navegación protegida al área privada; cierre de sesión; aislamiento de información por usuario; aprovisionamiento del perfil con `plan_id = 'free'` y `free_trip_credits = 1`; base de identidad para el control de suscripciones y del crédito Freemium. No se implementan aún consumo de crédito, viajes, cuotas de IA ni facturación.

## 2. Actores y permisos

| Actor | Identidad | Permisos en esta feature |
|---|---|---|
| Visitante | Sin sesión | Navegar sitio público e iniciar registro/login; uso anónimo del formulario, si se habilita en su propia feature |
| Usuario autenticado | Sesión válida de Supabase Auth | Acceder a su área privada; consultar/editar solo sus datos dentro de funcionalidades ya habilitadas |
| Personal administrativo | Rol `admin` en `public.profiles` (Q-05) | Acceso a datos globales solo mediante RLS; sin UI administrativa en esta feature |
| Servicios backend | Identidad de servicio verificada | Operaciones estrictamente autorizadas; sin exponer credenciales privilegiadas al cliente |

**Premisas:** el usuario no es automáticamente administrador; tener un panel administrativo diseñado no concede permisos ni define un rol.

## 3. Dentro de alcance

1. Implementar Supabase Auth en la nueva aplicación (`ADR-003`) con Email/Password y Google OAuth (`ADR-004`).
2. UI y estados de registro e inicio de sesión en la nueva app, reutilizando tokens/patrones del Design System sin modificar prototipos.
3. Gestión del estado de sesión: recuperación al recargar, expiración, salida y redirección segura; sesión inmediata con verificación diferida.
4. Protección de rutas y recursos privados, con control real en backend/RLS, no solo ocultación en UI.
5. Asociación inequívoca entre usuario autenticado y datos privados; creación de `public.profiles` mínimo mediante trigger (`ADR-005`), incluyendo `plan_id = 'free'` y `free_trip_credits = 1`.
6. Mensajes accesibles de validación y estados loading/error/success.
7. Pruebas de autorización, aislamiento entre usuarios, sesión y regresión visual/funcional de prototipos.
8. Contratos de integración con feature 04 (planes/cuotas) y feature 07 (dashboard), **sin implementarlas**.
9. Rol `user`/`admin` en `profiles` con RLS; sin UI administrativa en esta feature.
10. Aprovisionar `free_trip_credits = 1` en perfiles nuevos y en la reparación; el consumo del crédito y la creación del viaje pertenecen a Feature 05.

## 4. Fuera de alcance

- Cobros, Stripe, checkout, activación de suscripciones, precios comerciales, planes pagos, límites/cuotas de IA y contadores de consumo (feature 04). No existe trial de 14 días; el beneficio Free es un viaje con Pro 30 días, cuya creación/consumo pertenece a Feature 05.
- Generación de presupuestos/itinerarios, consumo de `free_trip_credits`, creación de viajes y almacenamiento de viajes (features 05–07).
- Sistema administrativo de roles, permisos de empleados, auditoría operativa y administración de cuentas, salvo la columna `role` y sus políticas RLS (`ADR-005`).
- Agentes de IA del producto, reservas y notificaciones.
- Migraciones de framework, routing, estructura, UI kit, diseño, estilos, tokens o componentes; ningún cambio estructural sin autorización.
- MFA, cierre global de sesiones, eliminación de cuenta y vinculación de identidades, salvo decisión posterior. OAuth social, verificación de correo y recuperación de contraseña ya fueron aprobados (`ADR-004`).
- UI administrativa, tablas globales de analíticas y gestión de usuarios por admin.

## 5. Flujos y casos límite

### F-01 Acceso público
El visitante puede consultar la landing y sus entradas de login/registro sin sesión; las acciones restringidas conducen al flujo aprobado sin filtrar datos privados.

### F-02 Registro
El visitante puede registrarse con Email/Password o Google OAuth. Google OAuth se considera verificado por el proveedor. Email/Password crea sesión inmediata y envía confirmación en segundo plano; el estado de verificación se expone a la app. El sistema crea el perfil mínimo mediante trigger (`ADR-005`) con `plan_id = 'free'` y `free_trip_credits = 1`.

### F-03 Inicio de sesión
El usuario puede iniciar sesión con Email/Password o Google OAuth. Credenciales válidas generan una sesión; credenciales rechazadas producen error no revelador. El destino posterior al login debe ser una ruta interna autorizada; no se permiten `returnTo` externos.

### F-04 Acceso privado
Sin sesión, el área privada no revela recursos del usuario. Con sesión válida, cada recurso debe validarse en servidor/base de datos mediante UID y políticas. Un usuario A no obtiene datos de B aunque altere URL, IDs o solicitudes.

### F-05 Cierre de sesión
La acción cierra la sesión local con SDK aprobado, limpia la información privada en memoria/cache cliente y conduce a una vista pública. Conservar garantías de revocación de tokens conforme al proveedor y la política definida, sin prometer invalidación inmediata de todos los JWT emitidos.

### F-06 Sesión caducada y error de conectividad
Sesión inválida/expirada → no se expone contenido privado; el sistema solicita autenticación. Sin red, muestra estado recuperable sin asumir que el usuario está desconectado si no se ha verificado.

### F-07 Prototipos y dashboard preexistentes
Los prototipos, el Design System y el dashboard existentes permanecen intactos. La nueva app (`ADR-003`) no los modifica ni los usa como evidencia de permisos administrativos.

### F-08 Crédito Free y reparación
Todo perfil nuevo nace con `free_trip_credits = 1`. Si el perfil falta o la creación falla, `repair_profile()` crea la fila propia con `plan_id = 'free'`, `role = 'user'` y `free_trip_credits = 1`. La reparación nunca reinicia un crédito consumido, no crea viajes y no acepta `free_trip_credits`, `plan_id`, `role` ni `email_verified` del cliente.

## 6. Requisitos funcionales

| ID | Comportamiento verificable | Fuente | Prioridad |
|---|---|---|---|
| FR-001 | Las rutas públicas siguen accesibles sin sesión; login/registro visibles en la nueva app según su diseño. | §3.1 | Must |
| FR-002 | El usuario puede registrarse con Email/Password o Google OAuth, con validación y feedback. | §3.1; `ADR-004` | Must |
| FR-003 | El usuario puede iniciar sesión con Email/Password o Google OAuth y recibir estado autenticado verificable. | §3.1; §6; `ADR-004` | Must |
| FR-004 | Las rutas privadas no permiten ver datos privados sin sesión válida y aplican autorización real sobre datos. | §3.2; RNF-04 | Must |
| FR-005 | El usuario puede cerrar sesión y el cliente deja de mostrar información privada en la sesión cerrada. | Requisito derivado necesario | Must |
| FR-006 | La interfaz sincroniza estado tras recarga, cambio de sesión y caducidad sin mostrar fugazmente datos de otro usuario. | Requisito derivado necesario | Must |
| FR-007 | Los recursos privados vinculados a `auth.uid()` quedan aislados entre identidades mediante políticas RLS. | RNF-04; RF-08 | Must |
| FR-008 | Las funcionalidades de planes y cuotas pueden leer de manera autorizada la identidad estable del usuario; **sin gestionar cuotas aquí**. | RF-08 (dependencia) | Must |
| FR-009 | Las acciones y formularios de autenticación incluyen estados de carga, validación, errores y accesibilidad. | RNF-01; §3 | Must |
| FR-010 | Los prototipos y el Design System existentes se preservan; la nueva app no los modifica. Cualquier ajuste fuera de alcance se detiene para aprobación. | Restricción explícita del propietario; `ADR-003` | Must |
| FR-011 | Al registrarse, el sistema crea un perfil mínimo en `public.profiles` con `id`, `email`, `email_verified`, `full_name`, `avatar_url`, `plan_id` (default `free`), `role` (default `user`), `free_trip_credits` (default `1`), `created_at` y `updated_at`. | `ADR-005`; `BR-FREE-001` | Must |
| FR-012 | El sistema expone el campo `email_verified`; OAuth lo establece en `true` y Email/Password en `false` hasta completar el flujo de verificación. | `ADR-004`; `ADR-005` | Must |
| FR-013 | El usuario no puede modificar `role`, `plan_id`, `email_verified` ni `free_trip_credits`; solo `admin` accede a datos globales mediante RLS. | `ADR-005`; `BR-FREE-010`; RNF-04 | Must |
| FR-014 | La nueva app se construye con React + TypeScript + Tailwind + Framer Motion + Vite + TanStack Router + `@supabase/supabase-js`, en la raíz del repositorio, con hosting Vercel y sin tocar los prototipos. | `ADR-003` | Must |
| FR-015 | El usuario con Email/Password puede solicitar recuperación de contraseña mediante un enlace/token de un solo uso, con expiración, rate limit y respuesta neutra. | `ADR-004`; `CORE-05-FR-004` | Must |
| FR-016 | Todo perfil nuevo se crea con `free_trip_credits = 1`; `repair_profile` que crea un perfil faltante también usa 1 y nunca reinicia un crédito ya consumido ni crea viajes. | `BR-FREE-001/002/006` | Must |
| FR-017 | `free_trip_credits` es de escritura exclusiva server-side; el cliente no puede insertarlo, actualizarlo ni enviarlo en el registro. | `BR-FREE-010`; RNF-04 | Must |
| FR-018 | Esta feature no implementa trial de 14 días, checkout, precios ni cuotas de IA; `plan_id` es solo un puntero de lectura para Feature 04. | `BR-FREE-004/008`; `CORE-01` | Must |

## 7. Requisitos no funcionales

| ID | Restricción observable | Método de verificación | Fuente |
|---|---|---|---|
| NFR-001 | TypeScript estricto y reutilización de tokens/patrones del Design System existente, sin modificar prototipos; experiencia mobile-first. | typecheck + matriz de viewports + diff revisión | RNF-01 + `ADR-003` |
| NFR-002 | Ningún token de servicio, `service_role` o secreto privilegiado reside en bundle/browser; TLS y gestión segura de variables según infraestructura aprobada. | inspección estática, bundle, configuración | RNF-04 + diseño seguro |
| NFR-003 | Toda consulta/mutación a recursos privados está sujeta a autorización server-side y RLS; no confiar en `user_id` del navegador. | pruebas cross-user y reglas DB | RNF-04 |
| NFR-004 | Los formularios de acceso son navegables por teclado, tienen labels, mensajes accesibles y feedback de espera/error. | pruebas a11y + revisión manual | RNF-01 |
| NFR-005 | No registrar passwords, tokens, enlaces secretos ni PII innecesaria en logs y reportes de errores. | revisión logs y código | Seguridad derivada |
| NFR-006 | La integración no modifica los prototipos ni la infraestructura existente; los cambios autorizados por `ADR-003`/`ADR-004`/`ADR-005` se limitan a la nueva app y a las migraciones aprobadas. | diff de archivos y revisión | `ADR-003`; restricción propietario |
| NFR-007 | El trigger de `auth.users` a `profiles` debe ser seguro (`SECURITY DEFINER`, `search_path` controlado) y no aceptar datos no confiables. | revisión SQL + pruebas de registro | `ADR-005` |
| NFR-008 | Un usuario no puede elevarse a `admin`, cambiar su `plan_id`, modificar `email_verified` ni alterar `free_trip_credits`; la protección debe combinar RLS, privilegios de columna o funciones seguras. | pruebas de escalada y actualización de perfil | `ADR-005`; `BR-FREE-010`; RNF-04 |
| NFR-009 | La app en la raíz no sobrescribe `AGENTS.md`, `MEMORY.md`, `README.md`, `docs/`, `specs/` ni `prototipos/`; solo añade sus propios archivos. | diff de archivos y revisión de estructura | `ADR-003` |
| NFR-010 | La migración de `free_trip_credits` debe ser aditiva e idempotente: los perfiles nuevos reciben 1; un crédito ya consumido en 0 no se reinicia; no se permite un valor negativo. | migración aplicada/rollback + pruebas de backfill | `BR-FREE-001/006/010` |

> RNF-02 (60 fps), RNF-03 (≤6 s para presupuestos/itinerarios) y RNF-05 (99,5 % disponibilidad) **no son criterios de aceptación específicos de login**; se mantienen como restricciones transversales, sin atribuir al login el SLA de generación IA.

## 8. Criterios de aceptación Given / When / Then

- **AC-001 (FR-001):** Given visitante sin sesión, When abre una URL pública y usa el enlace de acceso, Then ve la landing y las pantallas/controles de la nueva app sin depender de sesión.
- **AC-002 (FR-002):** Given Email/Password o Google OAuth con datos válidos, When envía registro, Then se crea una sesión inmediata (OAuth con `email_verified = true`; Email/Password con `email_verified = false`) y la UI comunica el estado sin asumir verificación que no existe.
- **AC-003 (FR-002/FR-009):** Given datos inválidos, When envía registro, Then la UI muestra errores útiles y no crea una cuenta utilizable mediante el flujo inválido.
- **AC-004 (FR-003):** Given identidad habilitada y credenciales válidas, When inicia sesión, Then se establece sesión verificable y se abre solamente un destino interno permitido.
- **AC-005 (FR-003/FR-009):** Given credenciales inválidas, When intenta acceder, Then no obtiene sesión ni detalles que permitan enumerar cuentas.
- **AC-006 (FR-004):** Given visitante sin sesión, When solicita URL/API/recurso privado, Then no accede a datos privados; el frontend muestra redirección o estado de acceso requerido según decisión de rutas.
- **AC-007 (FR-007):** Given usuarios A y B, When A intenta leer o cambiar datos privados de B alterando ID o consulta, Then la petición no revela ni altera los datos de B (también con llamada directa a la base de datos/API).
- **AC-008 (FR-005):** Given usuario autenticado, When cierra sesión, Then la UI vuelve a zona pública, elimina información privada del estado cliente y no puede continuar viendo contenido cacheado de la cuenta previa.
- **AC-009 (FR-006):** Given sesión válida, When recarga la página, Then se recupera el estado autenticado sin perder autorización; mientras se resuelve, no se presenta contenido privado de identidad anterior.
- **AC-010 (FR-006):** Given sesión caducada/no válida, When intenta acceder a un recurso privado, Then no se entregan datos y se solicita autenticación.
- **AC-011 (FR-008):** Given usuario autenticado, When un módulo autorizado consulta su identidad, Then recibe un UID verificable; ningún beneficio de plan se concede por una afirmación no verificada del cliente.
- **AC-012 (FR-009/NFR-004):** Given navegación teclado y viewport móvil, When usa registro/login/error/logout, Then puede operar los flujos sin barreras básicas y recibe mensajes accesibles.
- **AC-013 (FR-010/NFR-006):** Given implementación de la feature, When se revisa el diff, Then no hay cambios no autorizados en prototipos ni Design System, y los cambios de la nueva app se limitan a `ADR-003`/`ADR-004`/`ADR-005`.
- **AC-014 (NFR-002/NFR-005):** Given build y logs de prueba, When se revisan, Then no contienen secretos privilegiados ni tokens de sesión/passwords en claro.
- **AC-015 (FR-011):** Given un registro exitoso, When el trigger se ejecuta, Then existe exactamente una fila en `public.profiles` con `id` igual a `auth.users.id`, `plan_id` `free`, `role` `user`, `free_trip_credits = 1` y `email_verified` coherente con el proveedor.
- **AC-016 (FR-012):** Given login con Google OAuth o con Email/Password, When se consulta la sesión, Then OAuth reporta `email_verified = true` y Email/Password `false` hasta completar el flujo; la UI no muestra datos privados de otra identidad.
- **AC-017 (FR-013):** Given un usuario autenticado, When intenta actualizar `role`, `plan_id`, `email_verified` o `free_trip_credits` en su perfil, Then la operación es rechazada; solo un `admin` autorizado accede a datos globales según RLS.
- **AC-018 (FR-014):** Given la nueva app, When se revisa su stack y el diff, Then usa React + TypeScript + Tailwind + Framer Motion + Vite + TanStack Router + `@supabase/supabase-js`, se ubica en la raíz sin sobrescribir archivos existentes y no modifica los prototipos.
- **AC-019 (FR-015):** Given un email registrado, When solicita recuperación, Then recibe una respuesta neutra y puede establecer una nueva contraseña con un token válido; un token expirado o reutilizado falla sin revelar si la cuenta existe.
- **AC-020 (FR-003):** Given un `returnTo` externo o no autorizado, When el login se completa, Then la app rechaza el destino y redirige a una ruta interna segura.
- **AC-021 (FR-011):** Given un fallo al crear el perfil tras el registro, When el flujo termina, Then no queda un usuario autenticado sin perfil: el registro falla de forma recuperable o se activa la reparación definida, y la reparación crea `free_trip_credits = 1` sin reiniciar un crédito ya consumido.
- **AC-022 (FR-015):** Given solicitudes repetidas de recuperación por encima del límite configurado, When se procesan, Then se aplica el rate limit con respuesta neutra y sin revelar existencia de cuentas.
- **AC-023 (FR-016/NFR-010):** Given un perfil nuevo, o una reparación que crea una fila faltante, When se persiste, Then `free_trip_credits = 1`; si la fila ya existía con `0`, la migración/reparación no la cambia a 1 ni permite negativos.
- **AC-024 (FR-017):** Given un cliente que intenta insertar o actualizar `free_trip_credits`, When envía la operación, Then RLS/grants la rechazan y el valor solo cambia por servicio server-side.
- **AC-025 (FR-018):** Given la feature implementada, When se revisa el alcance, Then no contiene trial de 14 días, checkout, precios ni cuotas de IA; solo aprovisiona el crédito Free y el puntero `plan_id`.

## 9. Datos y reglas de negocio

### Confirmado por documento maestro
- Supabase Auth y PostgreSQL son tecnologías previstas para el MVP (§6).
- El panel de usuario requiere autenticación (§3.2).
- Los planes de suscripción condicionan funcionalidades y RF-08 exige verificación de identidad/consumo mediante Supabase Auth y BD (§4 y §7.1).
- RLS debe proteger los datos de los usuarios (RNF-04).

### Decisiones confirmadas (2026-10-20/21)
- `auth.users` es la identidad canónica; `public.profiles` se crea 1:1 con `id` FK a `auth.users.id` (`ADR-005`).
- Campos mínimos de `profiles`: `id`, `email`, `email_verified`, `full_name`, `avatar_url`, `plan_id` (default `free`), `role` (`user`/`admin`, default `user`), `free_trip_credits` (default `1`, entero ≥0), `created_at`, `updated_at`.
- Un trigger de PostgreSQL crea el perfil al registrarse; la función debe ser segura (`SECURITY DEFINER`, `search_path` controlado).
- `role`, `plan_id`, `email_verified` y `free_trip_credits` no son editables por el usuario; se requiere RLS + privilegios de columna/función segura.
- `plan_id` es ENUM `user_plan` con valores `free`, `occasional`, `frequent`; default `free`. Los precios oficiales son USD 0 / 4.99 / 9.99, pero esta feature no los implementa.
- `free_trip_credits` se inicializa en 1 (`BR-FREE-001`), no se reinicia al reparar/eliminar ni al cancelar (`BR-FREE-006/009`) y su consumo atómico pertenece a Feature 05 (`BR-FREE-002`).
- La verificación diferida usa `email_verified`; OAuth `true`; Email/Password `false` hasta completar el flujo. El plan debe definir token, envío, expiración y reenvío.
- RLS por UID en recursos privados; no exponer `service_role` ni secretos en frontend.
- La suscripción y las cuotas se gestionan fuera de esta feature; `plan_id` en `profiles` es un puntero de solo lectura para auth/feature 04 (`Q-14`).
- `email` duplica `auth.users.email`; se acepta el riesgo de desactualización hasta definir sincronización (`Q-14`).

### Invariantes

1. Cada fila de `auth.users` tiene exactamente una fila en `public.profiles`, con `profiles.id = auth.users.id`.
2. Si la creación del perfil falla, el registro falla de forma recuperable o se activa un mecanismo de reparación; no debe quedar un usuario autenticado sin perfil.
3. `role` solo puede ser `user` o `admin`; el valor por defecto es `user`.
4. `plan_id` solo puede ser `free`, `occasional` o `frequent`; el valor por defecto es `free`.
5. `free_trip_credits` es un entero ≥0; todo perfil nuevo nace en 1; no se reinicia al reparar, eliminar un viaje o cancelar; su consumo no pertenece a esta feature.
6. `email_verified` solo puede ser modificado por un flujo server-side confiable; OAuth lo establece en `true`; Email/Password en `false` hasta verificación.
7. El usuario no puede modificar `id`, `email`, `role`, `plan_id`, `email_verified` ni `free_trip_credits`; solo `full_name` y `avatar_url` son editables.
8. Ningún recurso privado se muestra sin sesión válida y autorización server-side.
9. Un usuario no puede leer ni modificar datos de otro, aunque altere IDs, URLs o payloads.
10. Al cambiar de cuenta o cerrar sesión, el cliente no muestra datos de la identidad anterior.
11. El rol `admin` no crea una UI administrativa; solo habilita políticas RLS cuando existan tablas globales.
12. `returnTo` y callbacks solo aceptan rutas internas permitidas; no hay open redirects.
13. No se registran contraseñas, tokens, enlaces secretos ni PII innecesaria en logs, telemetría o reportes de error.
14. `email` en `profiles` es una copia controlada; los cambios de email en `auth.users` quedan fuera de esta feature y deberán sincronizarse en una fase posterior.
15. `plan_id` en el cliente es informativo; la autorización de plan, crédito y cuotas se valida en servidor.
16. La reparación de perfil es idempotente: no duplica filas, no reinicia `free_trip_credits` y no crea viajes.

### Errores y casos límite

| Caso | Comportamiento esperado |
|---|---|
| Credenciales inválidas | Error neutro, sin revelar si el email existe; no se crea sesión. |
| Email ya registrado | Mensaje genérico o flujo de recuperación; no enumerar cuentas. |
| Google OAuth cancelado | Regreso al login con mensaje neutro; sin sesión. |
| Email OAuth ya existe con password | No se vincula automáticamente; se indica soporte o flujo futuro. |
| Red/Supabase no disponible | Estado recuperable; no se simula sesión ni éxito. |
| Sesión expirada | Se limpia el estado privado y se solicita autenticación. |
| Token de reset inválido/expirado/reutilizado | Error neutro; opción de solicitar uno nuevo. |
| Rate limit de login/reset | Mensaje con espera; no se bloquea permanentemente sin política. |
| Fallo del trigger de perfil | Registro falla de forma recuperable o se repara; no hay huérfano. |
| Crédito Free no aprovisionado | `repair-profile` crea la fila faltante con crédito 1; no se simula éxito. |
| Intento de editar `free_trip_credits` | RLS/grants rechazan; el valor solo cambia server-side. |
| RLS deniega acceso | Respuesta uniforme 403/404 sin revelar existencia. |
| `returnTo` externo | Se rechaza y se usa un destino interno seguro. |
| Variables de entorno faltantes | La app falla al iniciar/build; no arranca con configuración insegura. |
| Proveedor de correo caído | El reset/verificación queda pendiente o reintenta; no se muestra éxito falso. |
| Usuario no verificado | Acceso según política; la UI muestra el estado real, no “verificado”. |
| Cambio de rol/plan en otra sesión | La app refresca o invalida privilegios; no confía en estado stale. |
| Conflicto de archivos en la raíz | El build falla; no se sobrescriben archivos existentes. |

### Privacidad

- **Datos recogidos:** email, `email_verified`, `full_name`, `avatar_url`, `plan_id`, `role`, `free_trip_credits`, timestamps y metadatos mínimos de OAuth.
- **Finalidad:** identidad, sesión, autorización, preferencias básicas y comunicación transaccional.
- **Minimización:** no se solicitan datos que no sean necesarios para autenticación o perfil mínimo.
- **Google OAuth:** se reciben los datos que el proveedor entrega; el usuario debe conocer el consentimiento de Google.
- **Tokens:** access/refresh tokens gestionados por el SDK; no se guardan en stores de dominio, logs ni telemetría.
- **Verificación:** el token de `email_verified` debe almacenarse hasheado, ser de un solo uso y expirar; no se registra en logs.
- **Reset:** token de un solo uso, expiración y respuesta neutra; no se revela si el email existe.
- **Retención:** pendiente de `DQ-17`; no se promete un período sin decisión.
- **Derechos:** acceso, corrección y borrado quedan sujetos a la jurisdicción y a `DQ-17`.
- **Pruebas:** fixtures sintéticos; prohibido usar PII real o correos reales.
- **Secretos:** `service_role` y claves privilegiadas solo en servidor; la `anon key` es pública y depende de RLS.

### Dependencias

| Dependencia | Estado | Efecto |
|---|---|---|
| Supabase Auth/PostgreSQL/RLS | Aprobado por `ADR-001` | Base de identidad y autorización. |
| Google OAuth | Aprobado por `ADR-004` | Requiere credenciales y redirect allowlist. |
| Proveedor de correo | **Pendiente `Q-09`** | Reset y verificación se prueban con mock/local; producción requiere proveedor. |
| Vite + TanStack Router + Vercel | Aprobado por `ADR-003` | Scaffold, rutas y despliegue de la nueva app. |
| `specs/core/*` | **Aprobado v0.2.0 (2026-10-21)** | Referencia normativa para Freemium, perfiles, auth y pruebas. |
| Feature 04 (planes/cuotas) | Futura | Consume `plan_id`/UID; precios 4.99/9.99 y cuotas IA no se implementan aquí. |
| Feature 05 (viajes/crédito) | Futura | Crea viajes, consume `free_trip_credits` y fija `free_pro_expires_at`; no se implementa aquí. |
| `DQ-10` (pagos) | Abierta | La actualización de plan por webhook es post-MVP. |
| `DQ-17` (retención) | Abierta | Privacidad y retención definitivas. |

### Riesgos

| ID | Riesgo | Impacto | Mitigación propuesta |
|---|---|---|---|
| R-01 | Escalada de privilegios al editar `profiles`. | Alto | Revocar UPDATE de `role`/`plan_id`/`email_verified`/`free_trip_credits`; función segura; pruebas. |
| R-02 | Bypass de verificación de correo. | Alto | `email_verified` solo server-side; token firmado/hasheado. |
| R-03 | RLS permisiva o mal probada. | Alto | Matriz de pruebas cross-user y denegación por defecto. |
| R-04 | Open redirect en `returnTo`. | Medio | Allowlist de rutas internas. |
| R-05 | Fuga de tokens o PII en logs. | Alto | Redacción, revisión y pruebas. |
| R-06 | Vinculación incorrecta de cuentas OAuth/password. | Medio | No auto-vincular; flujo de soporte futuro. |
| R-07 | Trigger de perfil falla y deja huérfanos. | Alto | Transacción/reparación y prueba de fallo. |
| R-08 | App en la raíz sobrescribe archivos del harness. | Alto | NFR-009 y revisión de diff. |
| R-09 | Configuración de Vercel/Supabase incorrecta. | Medio | Variables por entorno, build fail-fast. |
| R-10 | `plan_id`/rol/crédito stale en cliente. | Medio | Refresco y autorización server-side. |
| R-11 | Divergencia con Core aprobado v0.2.0. | Medio | Implementar contra `CORE-04`/`CORE-05`; detenerse si hay contradicción. |
| R-12 | Falta de pruebas de auth/RLS. | Alto | `CORE-09` y pruebas específicas antes de release. |
| R-13 | Backfill/reparación reinicia `free_trip_credits` consumido. | Alto | Migración aditiva; no actualizar filas con 0; pruebas de idempotencia. |

### Preguntas y decisiones

| ID | Pregunta | Consecuencia | Estado |
|---|---|---|---|
| Q-01 | ¿Qué métodos de acceso están aprobados? | Email/Password + Google OAuth. | **Resuelta 2026-10-20** (`ADR-004`) |
| Q-02 | ¿Se exige verificación de correo? | Sesión inmediata; verificación diferida. | **Resuelta 2026-10-20** (`ADR-004`) |
| Q-03 | ¿Dónde se implementa y qué se autoriza? | App nueva sin tocar prototipos. | **Resuelta 2026-10-20** (`ADR-003`) |
| Q-04 | ¿Se crea `profiles`? | `profiles` mínimo con trigger. | **Resuelta 2026-10-20** (`ADR-005`) |
| Q-05 | ¿Existe rol administrativo? | `role` en `profiles` + RLS; sin UI admin. | **Resuelta 2026-10-20** (`ADR-005`) |
| Q-06a | ¿Se incluye recuperación de contraseña? | Incluida con Supabase Auth, token de un solo uso y respuesta neutra. | **Resuelta 2026-10-20** (`ADR-004`) |
| Q-12 | ¿Ubicación/bundler/router/hosting de la nueva app? | Vite + TanStack Router + Vercel, en la raíz del repo. | **Resuelta 2026-10-20** (`ADR-003`) |
| Q-12a | ¿Raíz del repo actual o repositorio nuevo? | Raíz del repositorio actual. | **Resuelta 2026-10-20** |
| Q-12b | ¿React Router v6 o TanStack Router? | TanStack Router. | **Resuelta 2026-10-20** |
| Q-12c | ¿Vercel o Netlify? | Vercel. | **Resuelta 2026-10-20** |
| Q-13 | ¿Configuración de Supabase para sesión inmediata? | “Confirm email” desactivado; `signUp` con sesión inmediata. | **Resuelta 2026-10-20** |
| Q-13a | ¿Cómo se verifica el correo después? | Campo propio `email_verified`; el plan define token/envío. | **Resuelta 2026-10-20** |
| Q-14 | ¿Representación/sincronización de `plan_id`? | ENUM `user_plan` default `free`; webhook de pago post-MVP. | **Resuelta 2026-10-20** |
| Q-14a | ¿Valores canónicos del enum? | `free`, `occasional`, `frequent`. | **Resuelta 2026-10-20** |
| Q-14b | ¿Crédito inicial y reinicio? | `free_trip_credits = 1`; no se reinicia al reparar/eliminar/cancelar. | **Resuelta 2026-10-21** (`BR-FREE-001/006/009`) |
| Q-14c | ¿Trial y precios? | No hay trial de 14 días; precios USD 0/4.99/9.99 son datos de Feature 04. | **Resuelta 2026-10-21** (`BR-FREE-004/008`) |
| Q-06b | ¿Se incluyen MFA y eliminación de cuenta? | Alcance funcional y protección adicional | Diferida |
| Q-07 | ¿Qué comportamiento tiene la sesión en varios dispositivos y el cierre de sesiones remotas? | Política de sesiones y UX | Diferida |
| Q-08 | ¿Se habilitan flujos anónimos de presupuestos y cómo se vinculan tras registro? | Dependencia con feature 03/05 | Diferida |
| Q-09 | ¿Qué entorno Supabase y proveedor de correo se utilizarán para pruebas y producción? | Configuración y pruebas | Diferida |

## 10. Matriz de trazabilidad

| Requisito | Criterios de aceptación | Fuente |
|---|---|---|
| FR-001 | AC-001 | §3.1 |
| FR-002 | AC-002, AC-003 | §3.1; `ADR-004` |
| FR-003 | AC-004, AC-005, AC-020 | §3.1, §6; `ADR-004` |
| FR-004 | AC-006, AC-007, AC-010 | §3.2, RNF-04 |
| FR-005 | AC-008 | Derivado |
| FR-006 | AC-009, AC-010 | Derivado |
| FR-007 | AC-007 | RNF-04 |
| FR-008 | AC-011 | RF-08 |
| FR-009 | AC-003, AC-005, AC-012 | RNF-01 |
| FR-010 | AC-013 | Restricción propietario; `ADR-003` |
| FR-011 | AC-015, AC-021, AC-023 | `ADR-005`; `BR-FREE-001` |
| FR-012 | AC-016 | `ADR-004` |
| FR-013 | AC-017, AC-024 | `ADR-005`; `BR-FREE-010` |
| FR-014 | AC-018 | `ADR-003` |
| FR-015 | AC-019, AC-022 | `ADR-004`; `CORE-05-FR-004` |
| FR-016 | AC-021, AC-023 | `BR-FREE-001/002/006` |
| FR-017 | AC-024 | `BR-FREE-010` |
| FR-018 | AC-025 | `BR-FREE-004/008` |
| NFR-001/NFR-004 | AC-012, AC-013 | RNF-01 |
| NFR-002/NFR-005 | AC-014 | RNF-04 + derivado |
| NFR-003 | AC-007 | RNF-04 |
| NFR-006 | AC-013, AC-018 | `ADR-003`; restricción propietario |
| NFR-007/NFR-008 | AC-015, AC-017, AC-024 | `ADR-005`; `BR-FREE-010` |
| NFR-009 | AC-018 | `ADR-003` |
| NFR-010 | AC-023 | `BR-FREE-001/006/010` |

## 11. Gate G1

- Claridad G0: **ready** — Q-01 a Q-06a, Q-12a/b/c, Q-13a, Q-14a/b/c resueltas; Q-09, Q-10 y Q-17 siguen diferidas con mock/local.
- Validación de requisitos: **completada para v0.2.0** — FR-001 a FR-018 y NFR-001 a NFR-010 tienen AC o justificación; no hay AC que dependa de un proveedor no aprobado.
- Aprobación explícita de `spec.md` v0.2.0: **aprobada el 2026-10-21** por el propietario del proyecto.
- **No implementar hasta validar `tasks.md` (G3), registrar autorización y seleccionar `TASK-###`.**

## 12. Aprobaciones registradas

### v0.1.0 — histórica

- **Documento:** `specs/features/02-authentication/spec.md`
- **Versión aprobada:** `0.1.0`
- **Aprobador:** propietario del proyecto
- **Fecha:** 2026-10-20
- **Estado:** `approved` (sustituido por la revisión v0.2.0)
- **Alcance:** habilitó la fase de plan v0.2.0. No autoriza implementación por sí sola.

### v0.2.0 — aprobada

- **Versión aprobada:** `0.2.0`
- **Cambio principal:** crédito Free (`free_trip_credits = 1`), protección server-side, eliminación del trial 14 días y alineación con Core aprobados.
- **Estado:** `approved`.
- **Aprobador:** propietario del proyecto.
- **Fecha:** 2026-10-21.
- **Alcance:** habilita la aprobación de `plan.md` v0.3.0 y la validación de `tasks.md` v0.3.0. No autoriza implementación por sí sola.

La aprobación no se extiende a las preguntas diferidas (`Q-06b`, `Q-07`, `Q-08`, `Q-09`, `Q-10`, `Q-11`, `Q-15`) ni a los cambios de infraestructura que requieran autorización específica.
