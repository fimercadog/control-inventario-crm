# Release — Agendar cita, slice 1/3: disponibilidad real (2026-09-15)

Primera de tres piezas post-gate-S12 para reemplazar el flujo "solicitá y te
llamamos" por un booking real. Roadmap completo (por qué 3 slices, qué decide
cada una) en la conversación que originó esto; resumen abajo.

## Alcance de este slice

| Bloque | Qué hace |
| --- | --- |
| **Disponibilidad real** | Cruza horario de atención (`config/scheduling.php`: 08:00-18:00, lun-sáb, paso de 30 min), duración del servicio y las citas ya existentes de cada veterinario (`practitioner_id`) para calcular huecos libres por día. |
| **Agendar cita** (`/agendar-cita`) | Página pública nueva: elegir servicio → fecha → horario de una grilla real → datos de la mascota y de contacto → confirmar. Crea un `Appointment` con `status=confirmed` **al instante** (no un Lead a revisar). |
| **Convive con `/solicitar-cita`** | El flujo viejo (S9, genera solo un Lead) sigue intacto y sin tocar — son dos entry points distintos por ahora. **Pendiente de decidir con Fidel**: si `/agendar-cita` reemplaza los CTAs de "Agendar cita" del sitio (header, footer, home, etc.) o conviven ambos. No se tocaron esos links en este slice para no romper el E2E existente de `/solicitar-cita`. |
| **Anti doble-booking** | `lockForUpdate()` sobre las citas del veterinario candidato dentro de la transacción de creación: dos visitantes no pueden quedarse con el mismo veterinario en el mismo horario. El segundo en llegar recibe `409`, no un 500 ni una cita duplicada. |

### Endpoints nuevos (públicos, sin auth, con throttle)

- `GET /api/public/appointments/services` — servicios activos (sin costo interno).
- `GET /api/public/appointments/species` · `GET /api/public/appointments/species/{id}/breeds`
- `GET /api/public/appointments/availability?service_id=&date=` — `{ date, slots: ["09:00", "09:30", …] }`.
- `POST /api/public/appointments/book` — `throttle:appointment-booking` (5/min/IP). Crea `Client` (get-or-create, `status=inactive` si es nuevo — mismo patrón que el catálogo) + `Patient` (get-or-create por nombre) + `Appointment` confirmado.

### Config nueva

`backend/config/scheduling.php` — horario fijo global (no por empresa/veterinario todavía; ver "Deuda" abajo).

### Sin cambios de esquema

No hizo falta ninguna migración: `Appointment` (`practitioner_id`, `service_id`, `starts_at`/`ends_at`/`duration_minutes`) y `Service.estimated_duration_minutes` ya traían todo lo necesario desde S4/S5.

## Verificación

| Gate | Resultado |
| --- | --- |
| `php artisan test` (SQLite) | **194 passed** (180 previos + 14 nuevos de `PublicSchedulingTest`), 747 assertions |
| `php artisan test` (MariaDB) | **No corrido en este slice** — no había servidor MariaDB disponible en la máquina al momento del cierre. Pendiente antes del próximo release gate completo. |
| `./vendor/bin/pint --test` | limpio |
| `npx tsc --noEmit` | limpio |
| `npm run lint` | limpio (mismo warning preexistente de `data-table.tsx` que ya existía) |
| `npm run build` | ✅, `/agendar-cita` generado como página estática |
| E2E Playwright (`e2e/agendar_cita.py`) | ✅ — agenda un turno real desde `/agendar-cita`, confirma el mensaje de éxito, loguea como veterinario y verifica la cita "Confirmada" en `/app/agenda` del día elegido. Capturas en `e2e/artifacts/agenda-*.png`. |

`PublicSchedulingTest.php` (14 tests) cubre: servicios/especies/razas públicos,
disponibilidad respeta horario de atención y anticipación mínima (60 min),
día cerrado (domingo) da grilla vacía, un hueco solo desaparece cuando **todos**
los veterinarios están ocupados (no con uno solo), booking crea cliente+mascota
nuevos, reutiliza cliente+mascota en una segunda reserva del mismo email,
rechaza horario fuera de atención (422), rechaza sin anticipación mínima (422),
**la segunda reserva del mismo horario con un solo veterinario da 409** (prueba
secuencial del anti-doble-booking), consentimiento obligatorio, honeypot,
throttle.

## Cosas que valen la pena registrar

- El linter del repo (`react-hooks/set-state-in-effect`, parte del React
  Compiler) rechaza `setState` síncrono al toparse con el body de un
  `useEffect`, incluso para resetear estado derivado de un cambio de prop. El
  patrón correcto que ya usa el resto del código: mover el reset al *handler*
  que cambia la dependencia (`onChange`), no a un `useEffect` separado —
  aplicado en `selectService`/`selectDate`/`selectSpecies` de
  `agendar-cita/page.tsx`.
- `PublicServiceResource::collection()` envuelve en `data` (como
  `PublicProductResource`); `Species`/`Breed` devueltos como `Collection` plana
  NO se envuelven — mismo comportamiento que ya tenía el resto del catálogo
  público, solo que hay que recordarlo al escribir el test.

## Deuda / próximos slices

Este es el slice **1 de 3** acordados con Fidel:

1. ✅ **Disponibilidad real + booking auto-confirmado** (este release).
2. ⏳ **Portal del dueño** — cuenta real (login propio, separado del panel de
   staff) para que el dueño vea y haga CRUD de sus propias citas.
3. ⏳ **Google Calendar** — sync automático hacia el calendario de la
   clínica/veterinario en cada create/reschedule/cancel (OAuth de la clínica,
   una sola vez, no por dueño); botón "Agregar a mi calendario" (ICS) como
   extra opcional para el dueño.

Otras deudas de este slice puntual:

- Horario de atención fijo en `config/scheduling.php` (no por empresa ni por
  veterinario). Suficiente para una sola clínica; si hace falta variar por día
  o por profesional, pasa a tabla.
- No se decidió si `/agendar-cita` reemplaza los CTAs "Agendar cita" del sitio
  que hoy apuntan a `/solicitar-cita` (header, footer, home, `/contacto`,
  `/servicios/[slug]`) — es una decisión de producto, no técnica.
- MariaDB no corrido en este slice (ver tabla de verificación).
