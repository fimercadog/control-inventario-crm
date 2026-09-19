# Módulo Transversal de Observabilidad, Logging Técnico y Soporte Remoto (v1.0.1)

Este documento define la arquitectura, componentes, configuración y procedimientos de instalación y actualización para el módulo transversal reutilizable de observabilidad del ERP.

---

## 🏛️ Arquitectura del Módulo y Portabilidad Separada

El módulo provee observabilidad técnica, trazabilidad por `Request ID`, sanitización recursiva de datos sensibles, manejo seguro de errores HTTP (403, 429, 500) y generación del contrato para tickets de soporte técnico remoto.

Para garantar cero conflictos al aplicar actualizaciones entre ramas (mediante `git cherry-pick`), la arquitectura divide estrictamente el **Core Inmutable** de la **Extensión Local por Vertical**.

```
                       [config/observability-vertical.php]  (Extensión Local)
                                       │
                                       ▼
[config/observability.php] (Core Inmutable v1.0.1)
       │
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

---

## 📂 Archivos del CORE Inmutable

Los siguientes archivos componen el núcleo reutilizable del módulo. **NO deben modificarse en las verticales de negocio**:

| Archivo | Rol en el Módulo |
|---|---|
| `app/Contracts/SupportContextInterface.php` | Contrato formal PHP para la estructura de soporte. |
| `config/observability.php` | Configuración base global e integrador core (v1.0.1). |
| `config/logging.php` | Configuración del canal de logs diarios (`LOG_CHANNEL=daily`). |
| `app/Services/ObservabilityService.php` | Servicio principal de observabilidad y diagnóstico. |
| `app/Services/LogSanitizer.php` | Motor de sanitización recursiva y enmascaramiento. |
| `app/Services/SupportPayloadService.php` | Adaptador/DTO para reportes de soporte técnico. |
| `app/Http/Middleware/RequestIdMiddleware.php` | Middleware de correlación e inyección de Request ID. |
| `bootstrap/app.php` | Registro de middleware y captura limpia de excepciones. |
| `docs/observability-module.md` | Documentación oficial del módulo. |
| `tests/Feature/TechnicalLoggingTest.php` | Suite de pruebas unitarias/integración y test de neutralidad. |

---

## 🟢 Archivo Permitido para Personalización por Vertical

Toda personalización local o específica de un producto/vertical debe realizarse **exclusivamente** en:

`config/observability-vertical.php`

```php
<?php

return [
    // Campos sensibles adicionales propios de esta vertical
    'additional_sensitive_fields' => [
        'custom_notes',
        'national_id',
        'financial_key',
    ],

    // Habilitar o registrar tipos de eventos personalizados
    'custom_events' => [
        'document_printed' => true,
    ],

    // Identificador del módulo/vertical
    'module_name' => env('OBSERVABILITY_MODULE_NAME', 'custom_vertical'),
];
```

---

## 🔴 Reglas de Inmutabilidad y Lo Que NUNCA Debe Modificarse Directamente

1. **NUNCA modificar `config/observability.php` directamente** en una rama de vertical. Toda extensión se hace en `config/observability-vertical.php`.
2. **NUNCA incluir términos de negocio o verticales específicas** en los archivos del CORE reutilizable.
3. **NUNCA modificar `ObservabilityService.php`, `LogSanitizer.php` o `bootstrap/app.php`** para incluir lógica de controladores o entidades de negocio.

---

## 🔄 Cómo Actualizar de v1.0.0 a Versiones Futuras

Dado que la personalización local reside en `config/observability-vertical.php`, las ramas pueden actualizar el CORE sin conflictos:

1. Cambiar a la rama de destino:
   ```bash
   git checkout <rama-destino>
   ```
2. Aplicar el commit de actualización del CORE mediante `cherry-pick`:
   ```bash
   git cherry-pick <HASH_DEL_COMMIT_CORE>
   ```
3. `git` actualizará `config/observability.php` y los archivos core de forma limpia sin tocar `config/observability-vertical.php`.
4. Validar la actualización:
   ```bash
   php artisan test --filter=TechnicalLoggingTest
   ```

---

## 🧪 Pruebas Requeridas

```bash
# Pruebas del módulo y test de neutralidad del CORE
php artisan test --filter=TechnicalLoggingTest

# Suite completa de pruebas backend
php artisan test
```
