# Release — Portal del dueño, slice 2/3 (2026-09-15)

Segunda de tres piezas post-gate-S12 para el booking real (ver
[release-s13-agendar-cita.md](release-s13-agendar-cita.md)). El dueño ya no
solo agenda: puede ver y gestionar (CRUD) sus propias citas con una cuenta
real, sin llamar a la clínica.

## Alcance de este slice

| Bloque | Qué hace |
| --- | --- |
| **Login sin password** | El dueño pide un enlace en `/portal/entrar` (solo el correo); si coincide con un `Client` existente, recibe un enlace firmado (`URL::temporarySignedRoute`, vence en 15 min, sin tabla de tokens propia). Mismo email para siempre/nunca revela si el correo existe. |
| **Guard `client` separado** | `config/auth.php`: guard+provider nuevos. `Client` ahora extiende `Illuminate\Foundation\Auth\User` (Authenticatable) en vez de `Model` — sigue siendo el mismo modelo de siempre para todo lo demás (deals, pedidos, pacientes…), solo gana la capacidad de loguearse. Sesión 100% aparte del panel de staff (`auth:sanctum`); un dueño nunca puede tocar rutas de staff. |
| **Portal** (`/portal`) | Lista las citas del dueño (`scheduled`/`confirmed`/`attended`/`no_show`/`cancelled`), con **Reagendar** (grilla de horarios real, mismo motor que `/agendar-cita`) y **Cancelar** para las activas. |
| **"Crear" delegado a `/agendar-cita`** | No hay formulario de alta duplicado dentro del portal: agendar con el mismo email de una cuenta existente resuelve al mismo `Client` (`firstOrCreate`, S13). El portal cubre R/U/D de las citas; el "create" del CRUD ya estaba resuelto. |

### Endpoints nuevos

- `POST /api/portal/login` — público, `throttle:portal-login` (5/min/IP), honeypot.
- `GET /api/portal/consume/{client}` — firmado (`signed`), `throttle:portal-consume`. Responde JSON (no redirige): el enlace del correo apunta al **frontend** (`/portal/entrar?url=...`), que lo consume por `fetch`/axios con `withCredentials` — una navegación directa de nivel superior desde el cliente de correo no manda el header `Origin` que `EnsureFrontendRequestsAreStateful` necesita para tratar el request como stateful.
- `GET /api/portal/me` · `POST /api/portal/logout` — `auth:client`.
- `GET /api/portal/appointments` — propias, `auth:client`.
- `PATCH /api/portal/appointments/{id}/reschedule` · `POST /api/portal/appointments/{id}/cancel` — `auth:client`, ownership verificado (`patient.client_id === $client->id`); de otro dueño → 404, no 403 (no confirma que la cita existe).

### Refactor de S13 (sin cambiar su comportamiento)

`PublicSchedulingController::freeSlots/practitioners/firstFreePractitioner` se
movieron a `App\Services\SchedulingService`, compartido ahora con
`PortalAppointmentController::reschedule` — el reagendado del dueño usa
**exactamente** el mismo `lockForUpdate` anti-doble-booking que el booking
público, no una reimplementación aparte. Los 14 tests de `PublicSchedulingTest`
se re-corrieron después del refactor: siguen en verde.

## Bug real encontrado y corregido en el cierre

El E2E (no los tests unitarios) destapó un defecto en código compartido:
`AuditService::record()` usaba `$request->user()?->id` para `audit_logs.user_id`
(columna con FK a `users`). En una ruta `auth:client`, `Authenticate::shouldUse`
hace que `$request->user()` sin guard explícito resuelva al **Client**
autenticado, no a un `User` de staff — escribir ese id rompía la FK con
`SQLSTATE[23000]` (500) en cada reagendado/cancelación real. Corregido en la
fuente compartida (no con un parche local en el controller nuevo): `AuditService`
ahora solo usa el actor cuando es efectivamente un `App\Models\User`; para
acciones del portal, `user_id` queda `null` (no hay "actor staff" que registrar).
Los tests de `Sanctum::actingAs()` no lo agarraron porque ese helper no pasa por
el mismo camino de resolución que un request HTTP real con `auth:client` — quedó
como regresión explícita (`assertDatabaseHas('audit_logs', ['user_id' => null])`)
en `PortalAppointmentTest`.

## Verificación

| Gate | Resultado |
| --- | --- |
| `php artisan test` (SQLite) | **215 passed** (194 previos + 21 nuevos: `PortalAuthTest` 11, `PortalAppointmentTest` 10), 797 assertions |
| `php artisan test` (MariaDB) | **No corrido** — sin servidor disponible en la máquina. Ver "Pendiente antes de producción" abajo — es el gate más importante que falta. |
| `./vendor/bin/pint --test` | limpio |
| `npx tsc --noEmit` | limpio |
| `npm run lint` | limpio (mismo warning preexistente de `data-table.tsx`) |
| `npm run build` | ✅, `/portal` y `/portal/entrar` generados como páginas estáticas |
| E2E Playwright — **los 4 corridos, no solo el nuevo** | `e2e/portal_dueno.py` ✅ (agenda → enlace mágico → entra → reagenda → cancela → se ve "Cancelada" en `/app/agenda`) · `e2e/agendar_cita.py` ✅ · `e2e/catalogo_publico.py` ✅ · `e2e/smoke_demo_veterinaria.py` ✅ (login de los 3 roles, permisos, **`/solicitar-cita`**, agenda, dashboard, receta PDF) |

Los 3 E2E preexistentes se re-corrieron a propósito, no solo el nuevo: la
consigna era confirmar que el portal no rompe `/agendar-cita`, `/solicitar-cita`,
el CRM ni la agenda — los cuatro quedaron verdes en la misma pasada.

## ⚠️ Pendiente antes de producción (no dar por hecho)

**El gate de MySQL/MariaDB + E2E Playwright completo sigue sin correr.** 215
tests verdes en SQLite no lo reemplaza — en particular, el `lockForUpdate()`
anti-doble-booking (compartido por S13 y este reagendado) es exactamente el
tipo de código cuyo comportamiento real depende del motor: SQLite serializa
escrituras con un lock de base de datos completo (un solo escritor a la vez),
lo que enmascara si el locking a nivel de fila funciona de verdad bajo el MVCC
de InnoDB en MySQL/MariaDB. Que pase en SQLite **no prueba** que el
anti-doble-booking sea seguro en el motor real de producción — hay que correrlo
explícitamente contra MariaDB antes de vender/desplegar esta rama, no asumirlo.

Igual de pendiente: la config de entorno para producción (SMTP real,
`APP_TIMEZONE`, dominios) — ya documentada en
[produccion-veterinaria.md](produccion-veterinaria.md), sigue igual.

## Deuda / decisiones abiertas de este slice

- El commit de `AuditService` no distingue "sin actor" (request público) de
  "actor es un Client" — ambos casos guardan `user_id: null`. Si en algún
  momento se quiere un registro de auditoría que diga *qué dueño* hizo un
  cambio, hay que ampliar el esquema (`audit_logs` necesitaría una columna
  polimórfica tipo `actor_type`/`actor_id`, no solo `user_id`). No se hizo acá
  para no tocar una tabla compartida más de lo necesario para este slice.
- Sin límite explícito de cuántas veces un dueño puede reagendar la misma cita,
  ni ventana mínima de anticipación para cancelar (hoy puede cancelar hasta el
  último minuto). Nadie lo pidió todavía; agregar si hace falta.
- **Slice 3/3 (Google Calendar) sigue sin arrancar**, tal como se acordó.
