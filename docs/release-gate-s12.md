# Release Gate S12 — vertical veterinaria (`vertical/veterinaria`)

Ejecutado 2026-09-09 sobre la rama `vertical/veterinaria` (fork de `core-base-estable`).
Gate completo del `project-reuse-orchestrator` + checklist de venta de Fidel.

---

## Resultado

| Chequeo | Resultado |
|---|---|
| Migraciones limpias desde #1 — **SQLite** | ✅ `migrate:fresh --seed` limpio |
| Migraciones limpias desde #1 — **MySQL/MariaDB 10.4.32** | ✅ `migrate:fresh --seed` limpio |
| Suite backend — **SQLite** | ✅ **180 tests, 695 aserciones**, verde |
| Suite backend — **MariaDB** | ✅ **180 tests**, verde (misma suite, `DB_CONNECTION=mysql`) |
| `pint` | ✅ passed |
| `tsc --noEmit` | ✅ sin errores |
| `npm run lint` | ✅ 0 errores (1 warning preexistente: `data-table.tsx`, React-Compiler + TanStack Table) |
| `npm run build` (producción) | ✅ 75/75 páginas, servido en el E2E |
| **E2E Playwright del flujo crítico** | ✅ **12/12 pasos verdes** (ver abajo) |
| `verifier` (claude-obsidian) sobre el diff de rama | ✅ ejecutado — 0 BLOCKER, 1 HIGH, 4 MEDIUM, 3 LOW |
| `comprehensive-review` (seguridad + arquitectura) sobre el diff | ✅ ejecutado — 1 CRÍTICO, 5 HIGH, 9 MEDIUM, 9 LOW |
| Revisión de permisos (`can:` en rutas vet) | ✅ 8 permisos clínicos, todas las rutas cubiertas + test de 403 a nivel middleware |
| Aislamiento por `company_id` | ✅ toda query y toda regla `exists()` scoped por empresa; sin IDOR |
| Integridad referencial (FKs migraciones vet) | ✅ revisada; 1 corrección (`consultation_diagnosis` → `restrictOnDelete`) |
| Soft-deletes clínicos | ✅ verificado por test; documentado |
| Configuración e infraestructura | ⚠️ 2 requisitos de deploy pendientes (SMTP, `APP_TIMEZONE`) — documentados |

---

## E2E Playwright — flujo crítico

`e2e/veterinaria_flujo_clinico.py` (gemelo de `catalogo_publico.py`). Chromium headless,
contexto en zona **America/Bogota** para validar que la agenda no corre las horas.

| # | Paso | Resultado |
|---|---|---|
| 1 | `/solicitar-cita` (form público) → éxito | ✅ `POST /public/appointments` 200 |
| 2 | login recepción → `/app/leads` con el lead, origen **"Solicitud de cita"** | ✅ |
| 3 | alta del **propietario** (Client) | ✅ `POST /clients` 201 |
| 4 | alta del **paciente** (mascota, especie, sexo) | ✅ `POST /patients` 201 |
| 5 | **agendar la cita** (09:00) — se verifica que la agenda muestra **9:00 sin corrimiento** | ✅ |
| 6 | **confirmar** la cita (acción de fila) | ✅ |
| 7 | marcar **atendida** | ✅ |
| 8 | **consulta SOAP** (S/O/A/P) | ✅ `POST /consultations` 201 |
| 9 | **vacuna con producto del inventario** → columna Stock = **"Descontado"** | ✅ movimiento `out` creado |
| 10 | **receta** + **descarga del PDF** | ✅ PDF real de ~878 KB |
| 11 | **dashboard**: fila **"Clínica"** (citas hoy, pacientes activos, vacunas por vencer, consultas del mes) | ✅ |
| 12 | **reportes clínicos** renderizan (pacientes atendidos, ingreso estimado por servicio) | ✅ |

Capturas en `e2e/artifacts/vet-*` (gitignored).

---

## Permisos

8 permisos clínicos: `services.manage`, `patients.manage`, `appointments.manage`,
`medical_records.manage`, `vaccinations.manage`, `prescriptions.manage`,
`procedures.manage`, `clinical_reports.view`.

- Todas las rutas vet en `routes/api.php` llevan `can:<permiso>`. Confirmado por
  `route:list` y por el nuevo test `VetPermissionsTest::test_reception_is_blocked_from_clinical_routes_at_the_middleware`
  (Recepción → 403 en `/consultations`, `/prescriptions`, `/procedures`, `/reports/clinical`).
- Roles: **Veterinario/a** (clínica completa), **Recepción** (agenda/pacientes/servicios,
  sin historia clínica ni recetas), **Ventas** (clientes sí, mascotas no — corregido, ver H2).
- Endpoints públicos (`/public/appointments`) fuera de `auth:sanctum`, con throttle.

## Aislamiento por `company_id`

- Multi-tenant por columna manual + `where('company_id', …)`, un deploy por clínica
  (`docs/multitenancy.md`). Sin global scope, por decisión.
- Toda query de los 12 controladores vet filtra por empresa antes de `findOrFail`
  (404, nunca 403-con-datos → sin IDOR en `/photo`, `/pdf`, `/confirm`, `/consent-document`, …).
- Toda regla `Rule::exists()` de FK está scoped a la empresa del usuario: no se puede
  adjuntar paciente/servicio/consulta/producto de otra empresa.
- `company_id` nunca se acepta del cliente (lo fuerza `BaseCrudController` / el controlador).
- Tests de regresión cross-tenant: `PatientTest`, `ServiceTest`, `SpeciesBreedTest`,
  `AppointmentTest`, `PrescriptionProcedureDiagnosisTest`.

## Seguridad — endpoint público `/solicitar-cita`

| Control | Estado |
|---|---|
| Honeypot (`company_website`) — descarte silencioso | ✅ testeado |
| Throttle `appointment-request` (5/min/IP) | ✅ testeado (429) |
| Validación (FormRequest, todos los campos con `max`) | ✅ |
| Consentimiento Ley 1581 (`accepted`) | ✅ testeado |
| No crea `Appointment` (solo `Lead`) | ✅ testeado (`Appointment::count() === 0`) |
| Sin enumeración de usuarios / sin info interna | ✅ respuesta idéntica siempre |
| 500 controlado si no hay empresa configurada | ✅ testeado |
| CAPTCHA | ⏭️ mejora futura (honeypot + throttle bastan para el MVP) |

## Integridad referencial (migraciones vet)

Todas las FKs revisadas. `patient_id`/`consultation_id`/`service_id` con `restrictOnDelete`
donde un borrado dejaría historia huérfana; `nullOnDelete` en refs opcionales
(`practitioner_id`, `product_id`, `stock_movement_id`, `breed_id`). `company_id`
`cascadeOnDelete` en todas. Corrección aplicada: `consultation_diagnosis.diagnosis_id`
pasó de `cascadeOnDelete` a `restrictOnDelete`.

## Soft-deletes clínicos

- `Patient`, `Consultation`, `Prescription`, `Procedure`, `ClinicalApplication` usan `SoftDeletes` + `restore`.
- **Regla confirmada por test** (`ClinicalApplicationTest::test_soft_delete_does_not_revert_stock`):
  soft-delete de una vacuna **NO revierte** el movimiento de stock — el movimiento
  `out` permanece, el registro queda `deleted_at`, no hay reversión automática, y la
  corrección es un **movimiento de ajuste explícito** (`type=adjustment`, capturado por
  recepción). El test verifica los 4 puntos.

---

## Hallazgos — corregidos en este gate

**Del `verifier` + `comprehensive-review` + el propio E2E.** Commit `74e4c4f`.

### Crítico
| # | Hallazgo | Corrección |
|---|---|---|
| C1 | **Zona horaria.** Citas guardadas en UTC y formateadas en la zona del navegador → una cita a las 09:00 en Bogotá se veía a las 04:00. La agenda calculaba "hoy" con `toISOString()` (UTC). | `config/app.php` lee `APP_TIMEZONE`; `.env.example` y el deploy fijan `America/Bogota`. Frontend: `isoDateLocal()` para el selector de día y los rangos. Verificado en el E2E (contexto Bogotá, se comprueba "9:00" sin corrimiento). |

### Alto
| # | Hallazgo | Corrección |
|---|---|---|
| A1 | **`AppointmentResource` filtraba el modelo entero** en la clave `resource` (colisión con `JsonResource::$resource`): `/app/citas` crasheaba (React #31) con ≥1 cita, y cada respuesta exponía el cliente anidado con PII (email/teléfono). | Se lee `$this->getAttribute('resource')`. |
| A2 | **`GET /clients/{id}/history` filtraba mascotas** (dato clínico) a cualquier `clients.manage` — el rol **Ventas** no tiene `patients.manage`. | La clave `patients` ahora exige `patients.manage`; si no, `[]`. Test nuevo. |
| A3 | **Portal público**: `Lead::firstOrCreate` por `(empresa,email,source)` → toda segunda solicitud del mismo correo se descartaba en silencio (y permitía "bloquear" un email). | `Lead::create` por solicitud, con ventana anti-doble-click de 5 min. Test nuevo (2 solicitudes → 2 leads). |
| A4 | **Stock negativo**: la aplicación clínica con producto descontaba sin validar existencias. | Mismo chequeo que `OrderController@confirm` dentro de la transacción → 422 y rollback. Test nuevo. |
| A5 | **`PUT /appointments/{id}` aceptaba cualquier `status`**, saltándose la máquina de transiciones. | `status` fuera de `StoreAppointmentRequest`; la cita solo avanza por `confirm`/`cancel`/`attended`/`no-show`. Test nuevo. |
| A6 | **Consentimiento de procedimiento en disco público** (dato sensible Ley 1581, URL sin sesión). | Pasa al disco `local`; se sirve por `GET /procedures/{id}/consent-document` (autenticado, `can:procedures.manage`, scoped por empresa). Foto del paciente sigue pública (imagen de producto, baja sensibilidad). Test nuevo. |

### Medio
| # | Hallazgo | Corrección |
|---|---|---|
| M1 | Sin chequeo de doble reserva de profesional/consultorio. | Validador de solapamiento en `StoreAppointmentRequest` (excluye `cancelled`/`no_show`). Test nuevo. |
| M2 | Las reglas `exists()` no excluían soft-deleted → se podía agendar/recetar contra un paciente/consulta eliminado. | `->whereNull('deleted_at')` en `patient_id`/`consultation_id` de los 5 request. |
| M3 | `ClinicalReportController` `Carbon::parse` sobre `from`/`to` crudo → 500 con basura. | `$request->validate(['from'=>'nullable|date','to'=>'nullable|date|after_or_equal:from'])`. |
| M4 | `consultation_diagnosis` pivot `cascadeOnDelete` → borrar un diagnóstico del catálogo lo borraba de historias pasadas. | `restrictOnDelete` (el `BaseCrudController` lo convierte en 422). |
| M5 | `ClinicalApplication` `PUT` podía cambiar `product_id`/`warehouse_id`/`quantity` sin recalcular el movimiento. | Esos 3 campos `prohibited` en update. |
| M6 | `ConsultationController::update` sincronizaba diagnósticos aunque el update se rechazara (409). | Guard: si la respuesta es 3xx+, devuelve sin tocar diagnósticos. |
| M7 | Leads del portal: `SOURCE_LABEL` sin `appointment` → badge "Origen" en blanco en `/app/leads`. | Añadido "Solicitud de cita". |
| M8 | Reporte "Ingresos por servicio" = precio de lista × atendidas, no facturado. | Renombrado a "Ingreso estimado por servicio". |

---

## Hallazgos — pendientes (backlog S13, NO bloquean el MVP con un solo deploy)

| # | Sev. | Hallazgo | Nota |
|---|---|---|---|
| P1 | Medio | **Pacientes soft-deleteados sin UI de restore ni filtro.** Borrar un paciente con historia siempre "funciona" (soft delete, no salta el 422 de FK); las citas/consultas viejas lo muestran sin nombre. `POST /patients/{id}/restore` existe pero no hay botón. | Añadir filtro "eliminados" + acción restore, o bloquear el borrado con historia y empujar a `status: inactive`. |
| P2 | Medio | **Los `<select>` de los modales tienen tope de 100 filas** (`crud-modal.tsx` + tope del backend). Con >100 pacientes, el paciente #101 no es seleccionable en "Nueva cita". | Convertir `optionsResource` en combobox con `?search=` (backend ya lo soporta). |
| P3 | Medio | **`revenue_by_service`** usa precio de lista vivo: subir un precio reescribe el histórico. | Snapshot del precio en la cita al crearla (patrón `order_items.unit_price`). |
| P4 | Bajo | `TableQueryService`: `sort` va de input crudo a `orderBy()` (grammar-wrapped, difícil de explotar; core, no nuevo). | Allowlist de columnas por controlador. |
| P5 | Bajo | `PrescriptionController` lee `Product::find()` sin scope de empresa (ya validado in-company por el request). | `->where('company_id', …)` por defensa en profundidad. |
| P6 | Bajo | `StoreProcedureImageRequest` solo acepta JPG/PNG/WEBP; una clínica escanea consentimientos a PDF. | Ampliar a PDF (ya está en disco privado tras A6). |
| P7 | Bajo | Seeder no crea diagnósticos/recetas/procedimientos demo. | Cosmético para la demo. |
| P8 | Bajo | Índices únicos compuestos `(company_id, name)` ~1030 bytes: fallan en MySQL viejo con row format COMPACT/REDUNDANT. | Verificado OK en MariaDB 10.4 (DYNAMIC). Si el server destino es viejo: `Schema::defaultStringLength(191)`. |

---

## Configuración de producción pendiente (requisitos de deploy)

| # | Requisito | Estado |
|---|---|---|
| 1 | **SMTP real** (`MAIL_MAILER=smtp` + credenciales). El flujo de recuperación de contraseña está implementado y testeado, pero con `MAIL_MAILER=log` **el enlace no llega** — no es funcionalidad entregable sin SMTP. Si el cliente no usa auto-reseteo (admin crea usuarios a mano), se puede dejar `log` y documentarlo. | ⏳ Plantilla y explicación en `docs/hostinger-deployment.md`. **No validado** (sin credenciales reales). |
| 2 | **`APP_TIMEZONE=America/Bogota`** en el `.env` del deploy (ver C1). | ⏳ Ya en `.env.example` y en la plantilla de `docs/hostinger-deployment.md`. |
| 3 | `APP_DEBUG=false`, `APP_ENV=production`, dominios/CORS/Sanctum al dominio real, `NEXT_PUBLIC_API_URL` del frontend. | ⏳ Checklist en `docs/hostinger-deployment.md`. |
| 4 | Backup de BD + plan de rollback de migraciones. | ⏳ Checklist de infra. |

## Contenido (marketing / demo)

No ejecutado en este gate. El copy profundo de marketing (`/nosotros`, `/precios`, `/blog`,
secciones de la home) y un dataset demo vet completo siguen pendientes — **pasada de
contenido pre-venta**. El MVP es funcionalmente completo y verificado; el contenido es
trabajo de venta, no de release técnico.

---

## Commits del gate S12

| Commit | Qué |
|---|---|
| `32e5f49` | `fix(vet): appointments usa dateTime, no timestamp (compat MariaDB)` (antes de este informe) |
| `74e4c4f` | `fix(vet): S12 release gate — seguridad, aislamiento y correctitud` (16 hallazgos + tests) |
| `d4517b2` | `test(vet): E2E Playwright del flujo clínico completo` |

---

## Estado final

# NEEDS FIXES → RESUELTO EN EL GATE · queda: requisitos de deploy

Todos los hallazgos **BLOCKER/HIGH y el CRÍTICO** encontrados por `verifier`,
`comprehensive-review` y el E2E **fueron corregidos y verificados con tests** en
este mismo gate (commit `74e4c4f`). La suite (180 tests) pasa en **SQLite y en
MariaDB**; el **E2E principal pasa 12/12**; `pint`/`tsc`/`lint`/`build` verdes.

**No se declara `READY FOR PRODUCTION`** porque persisten **dos configuraciones
necesarias para producción que no se pueden validar desde el repo**:

1. **SMTP real** — sin él, la recuperación de contraseña no es funcional.
2. **`APP_TIMEZONE`** en el `.env` del deploy.

Ambas están documentadas en `docs/hostinger-deployment.md` con plantilla lista.

**Acción para pasar a `READY FOR PRODUCTION`:** en el deploy real, setear
`APP_TIMEZONE=America/Bogota` y `MAIL_MAILER=smtp` con credenciales (o acordar con
el cliente que no habrá auto-reseteo y dejar `log`), correr la checklist de infra
(`APP_DEBUG=false`, dominios, backup) y un smoke test de login + una cita. El
código está listo; falta la configuración del entorno.

El backlog P1–P8 es evolución para S13 y **no bloquea** una operación de una sola
clínica con este deploy.
