# Avance — MVP vertical veterinaria (S0–S10)

Rama `vertical/veterinaria`, forkeada del tag `core-base-estable`.
Fase 4 del `project-reuse-orchestrator`, 2026-09-09. **S11 y S12 no ejecutados.**

## Estado por slice

| Slice | Commit | Estado |
|---|---|---|
| roadmap rev.2 | `6f6df44` | ✅ |
| S0 fork y rebranding ("VetPanel") | `d16c136` | ✅ |
| S1 plan + permisos clínicos + roles | `7024918` | ✅ |
| S2 especies y razas | `c33de60` | ✅ |
| S3 pacientes / mascotas | `6d8abef` | ✅ |
| S4 servicios veterinarios | `6d61dee` | ✅ |
| S5 citas y agenda | `092482f` | ✅ |
| S6 historia clínica / consultas SOAP | `38e08f8` | ✅ |
| S7 vacunas y desparasitación (+ stock) | `6a4dbc8` | ✅ |
| S8 prescripciones · procedimientos · diagnósticos | `ba776e5` | ✅ |
| S9 portal público "solicitá tu cita" | `cdbe81c` | ✅ |
| S10 reportes clínicos + dashboard vet | `292492e` | ✅ |
| S11 hospitalización · lab · documentos | — | ⏭️ v1.1, no ejecutado |
| S12 release gate | — | ⏭️ pendiente de aprobación |

## Funcionalidades terminadas y listas para usar

- **Propietarios y pacientes** — `Client` sigue siendo core; cada mascota
  (`Patient`, con especie/raza/sexo/peso/microchip/foto) cuelga de su propietario.
  Soft-delete + restore. Desde el detalle del cliente se ven sus mascotas.
- **Catálogos** — Especies, Razas (raza validada contra su especie), Servicios
  (`Service`, entidad propia con precio y duración, ≠ `Product`).
- **Citas / Agenda** — `Appointment` **sin `client_id`** (propietario vía
  `patient`); servicio opcional; estados programada→confirmada→atendida/no asistió/
  cancelada; `/app/agenda` vista del día con navegación.
- **Historia clínica** — `Consultation` SOAP (S/O/A/P + peso/temperatura);
  crear desde una cita la marca "atendida"; timeline en el paciente; soft-delete.
- **Vacunas / desparasitación** — `ClinicalApplication` (acto clínico): con lote y
  vencimiento manuales; si se elige un producto del inventario, descuenta stock
  (movimiento `out`, guarda `stock_movement_id`); `/app/vacunas-pendientes` lista
  las próximas a vencer.
- **Prescripciones** — con líneas de medicamento (snapshot de SKU) y **PDF
  imprimible** (dompdf).
- **Procedimientos** — tipo, fecha, veterinario, adjunto de consentimiento.
- **Diagnósticos** — catálogo + asociación many-to-many con las consultas.
- **Portal público** — `/solicitar-cita` genera un `Lead` `source=appointment`
  (NO una cita); honeypot; recepción agenda desde `/app/leads`.
- **Reportes clínicos** — `/reports/clinical` (rango de fechas): pacientes
  atendidos, consultas, vacunas/desparasitaciones, citas por estado y profesional,
  ingresos por servicio.
- **Dashboard** — fila "Clínica" (citas hoy, pacientes activos, vacunas por
  vencer, consultas del mes); el resto del payload core intacto.
- **Roles** — "Veterinario/a" (clínica completa), "Recepción" (agenda/pacientes/
  servicios, **sin** historia clínica ni recetas).
- **Identidad** — "VetPanel", favicon huella, SEO/metadata, shell y chrome de
  marketing rebrandeados.

## Métricas

- **Backend: 172 tests** (657 aserciones), todos verdes. +58 tests vet nuevos.
- Baseline completo verde: `php artisan test`, `pint`, `tsc --noEmit`,
  `npm run lint` (1 warning preexistente de React-Compiler), `npm run build`.
- Migraciones limpias desde #1 en SQLite. 8 migraciones vet nuevas.
- 127 archivos cambiados vs `core-base-estable` (+5934 / −304).
- Working tree limpio; 12 commits `feat(vet): SN`.

## Decisiones tomadas durante el desarrollo

- **`Appointment` sin `client_id`** (corrección de Fidel): el propietario se
  resuelve en el `AppointmentResource` vía `patient.client`, sin segundo request.
- **Grupo de nav "Clínica"** nace en S2 (con contenido), no vacío en S1.
- **Estrategia de lotes**: en el MVP `lot`/`expires_at` se cargan a mano en el
  acto clínico. Inventario real por lote/vencimiento = evolución futura (el core
  no maneja lotes).
- **Soft-delete de `ClinicalApplication` no revierte el movimiento de stock** —
  se corrige con un ajuste manual (documentado en el roadmap S7).
- **Portal público solo crea `Lead`** — no `Appointment` (anti-spam; recepción
  confirma disponibilidad).
- **Dashboard extendido, no reescrito** — se agregó la key `clinical`; el
  `DashboardTest` y `use-dashboard` siguen válidos.
- **Copy profundo de marketing y dataset demo vet completo**: NO se hicieron.
  Quedan para la pasada de contenido pre-venta (el copy describe features que se
  terminaron de definir en estos slices).

## Bugs encontrados y arreglados en el propio slice

- `Company::factory()` sin `name` por defecto → los tests pasan `['name' => …]`.
- `Appointment.status` no tomaba el default de BD al crear → `$attributes` en el
  modelo.
- SQLite guarda las columnas `date` como `'YYYY-MM-DD 00:00:00'`; `whereBetween`
  con strings `'YYYY-MM-DD'` dejaba fuera el último día → se usa `whereDate`
  (S10, `ClinicalReportController` y `DashboardController`).
- `company_id` ambiguo tras `join` con `users` en el reporte clínico → columnas
  calificadas.

## Fixes que volvieron a `master`

**Ninguno.** No apareció ningún defecto del core que exigiera corregirlo en el
proyecto base durante S0–S10. (El endurecimiento del core — `StoreUserRequest`,
fallback de tenant, hash de password en auditoría — ya se había hecho en `master`
antes de forkear, tag `core-base-estable`.)

## Deuda pendiente (no bloquea el MVP)

| # | Deuda | Nota |
|---|---|---|
| 1 | Copy profundo de marketing (`/nosotros`, `/precios`, `/blog`, homepage secciones) | Pasada de contenido pre-venta |
| 2 | Dataset demo vet completo (más pacientes, historias, agenda poblada) | Pasada de demo pre-venta |
| 3 | Inventario por lote/vencimiento | Evolución futura; el MVP registra lote a mano |
| 4 | Multitenancy manual sin global scope | OK para 1 deploy por clínica (`docs/multitenancy.md`) |
| 5 | `MAIL_MAILER=log` en la config prod documentada | Configurar SMTP real en el gate |
| 6 | Endpoints públicos sin CAPTCHA (S9 tiene honeypot) | Evaluar si hay abuso |
| 7 | Form de cita: `starts_at`/`ends_at` como texto con patrón | Sin datetime-local en `CrudField`; la agenda es la UX principal |
| 8 | Soft-delete de `ClinicalApplication` no revierte stock | Ajuste manual; documentado |
| 9 | S11 (hospitalización, lab, documentos clínicos) | v1.1 |

## Flujo completo del MVP

```
sitio web /solicitar-cita
   → Lead (source=appointment)          ✅ S9
   → recepción abre /app/leads
   → registra al Propietario (Client)   ✅ core + S3 label
   → da de alta el Paciente (mascota)   ✅ S3
   → agenda la Cita (servicio, box)     ✅ S5
   → marca la cita "atendida"
   → registra la Consulta SOAP          ✅ S6  (marca la cita atendida sola)
   → aplica una Vacuna → descuenta stock del producto  ✅ S7
   → emite la Receta → PDF              ✅ S8
   → el Dashboard refleja la actividad  ✅ S10 (citas hoy, consultas del mes…)
   → Reportes clínicos del período       ✅ S10
```

Cada tramo está cubierto por tests de feature.

## Estado general

**READY FOR RELEASE GATE.**

El MVP S0–S10 está funcional y verificado con 172 tests. Antes de vender/desplegar
para una clínica real corresponde ejecutar **S12** (gate pesado): suite en
MySQL/MariaDB además de SQLite, E2E Playwright del flujo crítico, `verifier` /
`comprehensive-review:full-review` sobre el diff de la rama, y la checklist de
infra (SMTP real, `APP_DEBUG=false`, dominios/CORS/Sanctum, backup + rollback).
Más las dos pasadas de contenido pendientes (marketing + demo) si el destino es
una venta.
