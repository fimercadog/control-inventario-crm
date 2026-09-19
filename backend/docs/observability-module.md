# Módulo Transversal de Observabilidad, Logging Técnico y Soporte Remoto (v1.0.0)

Este documento define la arquitectura, componentes, configuración y procedimientos de instalación para el módulo transversal reutilizable de observabilidad del ERP.

---

## 🏛️ Arquitectura del Módulo

El módulo provee observabilidad técnica, trazabilidad por `Request ID`, sanitización recursiva de datos sensibles, manejo seguro de errores HTTP (403, 429, 500) y generación del contrato para tickets de soporte técnico remoto, sin acoplamiento a ninguna vertical de negocio concreta.

```
[Cliente / App]
       │ (Header: X-Request-ID)
       ▼
[RequestIdMiddleware] ──> Asigna / valida X-Request-ID y contexts en Monolog
       │
       ▼
[ObservabilityService] ──> Centraliza sanitización, contexto y logs técnicos
       ├── LogSanitizer ──> Sanitización recursiva (Global + Vertical)
       ├── Logging Daily ──> storage/logs/laravel-YYYY-MM-DD.log (Retención: 30 días)
       └── Support Payload ──> DTO desensibilizado para soporte técnico
       │
[Manejador de Excepciones] (bootstrap/app.php)
       └── Captura 403, 429 y 500 ──> Registra eventos desensibilizados en Log
```

### 🔒 Independencia de la Auditoría Funcional
- **Observability (Módulo Técnico):** Almacena logs de infraestructura, seguridad (403, 429, fallos de auth), errores 5xx y UUIDs de request en archivos rotativos (`storage/logs/laravel-*.log`).
- **AuditService / `audit_logs` (Módulo de Negocio):** Almacena cambios en la base de datos (creación, edición, eliminación de registros) en la tabla `audit_logs`. **Ambos sistemas son 100% independientes.**

---

## 📂 Archivos del Núcleo Reutilizable (Core Files)

| Archivo | Rol en el Módulo |
|---|---|
| `app/Contracts/SupportContextInterface.php` | Contrato formal PHP para la estructura de soporte. |
| `config/observability.php` | Configuración central, versionado y extensiones por vertical. |
| `config/logging.php` | Configuración del canal de logs diarios (`LOG_CHANNEL=daily`). |
| `app/Services/ObservabilityService.php` | Servicio principal de observabilidad y diagnóstico. |
| `app/Services/LogSanitizer.php` | Motor de sanitización recursiva y enmascaramiento. |
| `app/Services/SupportPayloadService.php` | Adaptador/DTO para reportes de soporte técnico. |
| `app/Http/Middleware/RequestIdMiddleware.php` | Middleware de correlación e inyección de Request ID. |
| `bootstrap/app.php` | Registro de middleware y captura limpia de excepciones. |
| `docs/observability-module.md` | Documentación oficial del módulo. |
| `tests/Feature/TechnicalLoggingTest.php` | Suite de pruebas unitarias/integración y test de neutralidad. |

---

## ⚙️ Variables de Entorno (`.env`)

Las siguientes variables son opcionales y cuentan con valores por defecto seguros:

```ini
# Canal y retención de logs
LOG_CHANNEL=daily
LOG_LEVEL=debug
LOG_DAILY_DAYS=30

# Módulo de Observabilidad
OBSERVABILITY_REQUEST_HEADER=X-Request-ID
OBSERVABILITY_MODULE_NAME=core_erp

# Integración futura APM (Opcional)
SENTRY_ENABLED=false
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1
```

---

## 🚀 Pasos para Instalar en Otra Rama / Vertical

### Opción A: Mediante Git Cherry-Pick (Recomendado)
1. Cambiar a la rama de destino:
   ```bash
   git checkout <rama-destino>
   ```
2. Aplicar el commit del módulo transversal:
   ```bash
   git cherry-pick <HASH_DEL_COMMIT_OBSERVABILIDAD>
   ```
3. Correr las pruebas para confirmar la integración limpia:
   ```bash
   php artisan test --filter=TechnicalLoggingTest
   ```

### Opción B: Copia Manual de Archivos Núcleo
1. Copiar los 10 archivos listados en la sección de **Archivos del Núcleo Reutilizable**.
2. Verificar que `config/logging.php` tenga `LOG_CHANNEL=daily`.
3. Ejecutar `php artisan test --filter=TechnicalLoggingTest`.

---

## 🟢 Adaptaciones Permitidas por Vertical

Cada vertical puede personalizar aspectos específicos **sin modificar el código fuente del núcleo**, editando la sección `vertical_extensions` de `config/observability.php`:

```php
// config/observability.php
'vertical_extensions' => [
    // Agregar campos sensibles específicos de la vertical
    'additional_sensitive_fields' => [
        'custom_notes',
        'national_id',
        'financial_key',
    ],
    // Habilitar o registrar tipos de eventos personalizados
    'custom_events' => [
        'document_printed' => true,
    ],
    // Nombre identificador de la vertical/módulo
    'module_name' => 'custom_vertical',
],
```

---

## 🔴 Adaptaciones Prohibidas (Restricciones del Núcleo)

1. **PROHIBIDO** incluir términos de negocio o referencias a productos específicos en el núcleo reutilizable (`ObservabilityService`, `LogSanitizer`, `RequestIdMiddleware`, `SupportContextInterface`).
2. **PROHIBIDO** guardar passwords, tokens o stack traces completos en las respuestas JSON enviadas al cliente.
3. **PROHIBIDO** mezclar consultas a la tabla `audit_logs` dentro del flujo de logs técnicos de excepciones.
4. **PROHIBIDO** eliminar los campos obligatorios del contrato de soporte (`request_id`, `user_id`, `company_id`, `module`, `url`, `timestamp`, `environment`, `app_version`).

---

## 🧪 Pruebas Requeridas

Para validar la correcta operación del módulo en cualquier rama:

```bash
# 1. Pruebas específicas del módulo y test de neutralidad
php artisan test --filter=TechnicalLoggingTest

# 2. Suite completa de pruebas backend
php artisan test
```

---

## 🔄 Procedimiento de Rollback

Si se requiere revertir el módulo en una rama:
1. Revertir el commit de observabilidad:
   ```bash
   git revert <HASH_DEL_COMMIT_OBSERVABILIDAD>
   ```
2. Restablecer el canal de logs en `.env` si aplica:
   ```ini
   LOG_CHANNEL=single
   ```
3. Ejecutar `php artisan test` para confirmar la estabilidad del backend.
