# Puesta en producción — VetPanel (vertical veterinaria)

Checklist y plantilla de configuración para desplegar una copia como producción
para una clínica real. Complementa `docs/hostinger-deployment.md` (mecánica de
Hostinger + Vercel); acá está **qué valores hay que suministrar** y por qué.

> Estado del código: `READY FOR DEMO`. Falta **solo configuración de entorno**:
> SMTP real y los dominios/URLs reales del cliente. Nada de esto es código.

---

## 1. Backend — plantilla `.env` de producción

```env
APP_NAME="Nombre de la clínica"           # aparece en el título del panel y en correos
APP_ENV=production
APP_KEY=                                    # lo genera: php artisan key:generate --force
APP_DEBUG=false                            # OBLIGATORIO false en producción
APP_URL=https://api.clinica-cliente.com    # URL pública real de la API

# Zona horaria de la clínica. SIN esto la agenda muestra las citas corridas
# según la zona del navegador (hallazgo C1 del Release Gate S12).
APP_TIMEZONE=America/Bogota                 # ajustar si la clínica no está en Colombia

# Frontend (Vercel u otro). Alimenta CORS y el enlace de "recuperar contraseña".
FRONTEND_URL=https://panel.clinica-cliente.com
CORS_EXTRA_ORIGINS=                         # solo si hay más de un origen de frontend

LOG_CHANNEL=stack
LOG_LEVEL=error

# --- Base de datos ---
# SQLite alcanza para una sola clínica (bajo volumen). Para MySQL/MariaDB:
DB_CONNECTION=sqlite
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=vetpanel
# DB_USERNAME=vetpanel
# DB_PASSWORD=<contraseña de la BD>        # ← SUMINISTRAR

# --- Sesión / Sanctum SPA (auth por cookie) ---
SESSION_DRIVER=database
SESSION_LIFETIME=120
# Si el frontend y la API son SUBDOMINIOS del mismo dominio raíz:
SESSION_DOMAIN=.clinica-cliente.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
SANCTUM_STATEFUL_DOMAINS=panel.clinica-cliente.com   # el host del frontend, SIN https://
# Si el frontend NO es subdominio de la API (cookie cross-site):
#   SESSION_SAME_SITE=none  ·  quitar SESSION_DOMAIN  (ver advertencia de cookies
#   de terceros en docs/hostinger-deployment.md)

CACHE_STORE=database
QUEUE_CONNECTION=sync
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
BCRYPT_ROUNDS=12

# --- Correo real (SMTP) ---
# OBLIGATORIO si la clínica va a usar "recuperar contraseña". Con MAIL_MAILER=log
# el enlace de reseteo se escribe al log y NUNCA llega al usuario: el flujo está
# implementado y testeado, pero sin SMTP NO es funcionalidad entregable.
MAIL_MAILER=smtp
MAIL_HOST=                                  # ← SUMINISTRAR (ej. smtp-relay.brevo.com)
MAIL_PORT=587
MAIL_USERNAME=                              # ← SUMINISTRAR
MAIL_PASSWORD=                              # ← SUMINISTRAR
MAIL_SCHEME=tls
MAIL_FROM_ADDRESS="no-responder@clinica-cliente.com"   # ← SUMINISTRAR
MAIL_FROM_NAME="${APP_NAME}"
# Alternativa: si el cliente NO usará auto-reseteo (el admin crea/resetea
# usuarios a mano), se puede dejar MAIL_MAILER=log y dejarlo por escrito.
```

### Valores que TENGO que darle a quien despliega

| Variable | Qué es | Cómo obtenerlo |
|---|---|---|
| `APP_NAME` | Nombre visible de la clínica | Lo define el cliente |
| `APP_URL` | Dominio/subdominio de la API | Se decide al comprar/configurar el hosting |
| `FRONTEND_URL` | Dominio/subdominio del panel | Idem |
| `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN` | Derivados de los dos anteriores | — |
| `APP_TIMEZONE` | Zona de la clínica | Por defecto `America/Bogota` |
| `DB_PASSWORD` (si MySQL) | Contraseña de la base | La crea el proveedor de hosting |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_SCHEME` | Credenciales SMTP | **Cuenta en Brevo / Mailgun / Amazon SES / SMTP del proveedor.** Sin credenciales reales → dejar `MAIL_MAILER=log` documentado con el cliente. |
| `MAIL_FROM_ADDRESS` | Remitente de los correos | Correo del dominio de la clínica |

**No hay credenciales SMTP inventadas en este repo.** Si al desplegar todavía no
existen, el reseteo de contraseña queda como pendiente de configuración (no como
funcionalidad rota).

---

## 2. Frontend — variables (`NEXT_PUBLIC_*` se hornean en el build)

```env
NEXT_PUBLIC_API_URL=https://api.clinica-cliente.com/api   # con el sufijo /api
NEXT_PUBLIC_SITE_URL=https://panel.clinica-cliente.com
NEXT_PUBLIC_PLAN=                          # vacío = plataforma completa
NEXT_PUBLIC_DEMO_MODE=false                # OCULTA los atajos de "usuarios demo" del login
```

- `NEXT_PUBLIC_DEMO_MODE=false` es lo que separa una **demo showcase** de un
  **deploy de cliente**: con `false` desaparecen los botones de login rápido.
- `NEXT_PUBLIC_PLAN=base` si la clínica es chica y no quiere ver el ciclo
  comercial B2B (oculta Planes/oportunidades, Reportes comerciales,
  Transferencias). Para la demo se deja vacío para mostrar todo.
- Redeploy del frontend cada vez que cambie una `NEXT_PUBLIC_*`.

---

## 3. Pasos de despliegue (backend)

```bash
cd backend
composer install --no-dev --optimize-autoloader
cp .env.example .env          # y editar con los valores de arriba
php artisan key:generate --force
php artisan migrate --force   # instala desde la migración #1
php artisan db:seed --force   # OPCIONAL: solo si se quiere el dataset demo;
                              # para un cliente real, sembrar solo la empresa+usuarios
php artisan storage:link      # enlaza public/storage -> storage/app/public
                              # (fotos de pacientes; los consentimientos van a disco privado)
php artisan config:cache
php artisan route:cache
```

Permisos de carpetas (usuario del servidor web, típicamente `www-data`):

```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache
# si DB_CONNECTION=sqlite:
touch database/database.sqlite && chown www-data:www-data database/database.sqlite
```

Tras cada cambio de código: `git pull && composer install --no-dev -o &&
php artisan migrate --force && php artisan config:cache && php artisan route:cache`.

---

## 4. Cliente real: qué sembrar (en vez del dataset demo)

Para un cliente que NO quiere datos ficticios, correr solo la parte de
identidad. Opciones:

- **Rápido:** `php artisan db:seed --force` y después borrar los datos demo
  desde el panel (o un `tinker` de limpieza), dejando empresa + usuarios.
- **Limpio:** crear un `ClienteRealSeeder` que siembre únicamente:
  `Company` (datos reales de la clínica), permisos + roles (el bloque
  `seedRolesAndUsers` sirve tal cual), y los usuarios reales del personal con
  contraseñas temporales. El resto (especies/razas/servicios) lo carga la
  clínica desde el panel, o se copia del demo lo genérico (especies, razas,
  servicios estándar) sin los propietarios/pacientes ficticios.

Usuarios demo (`@vetlosandes.co`, contraseña `password`): **rotar o eliminar**
antes de entregar. `NEXT_PUBLIC_DEMO_MODE=false` los oculta del login pero
siguen existiendo en la BD hasta que se cambien.

---

## 5. Checklist de infraestructura (marcar antes de entregar)

- [ ] `APP_DEBUG=false`, `APP_ENV=production`
- [ ] `APP_TIMEZONE` = zona real de la clínica
- [ ] `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN` = dominios reales
- [ ] `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` = dominios reales, **build hecho después**
- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] HTTPS en ambos dominios (Sanctum SPA con cookie segura lo exige)
- [ ] `MAIL_MAILER=smtp` con credenciales reales **o** acuerdo escrito de que no habrá auto-reseteo
- [ ] Enviado un correo de prueba: `php artisan tinker` → `Password::sendResetLink(['email' => 'un-usuario-real'])` y verificar que llega
- [ ] `php artisan storage:link` ejecutado; subir una foto de paciente de prueba y verla
- [ ] Usuarios demo rotados/eliminados; contraseñas del personal real entregadas por canal seguro
- [ ] **Backup de BD** automático (diario) — SQLite: copiar `database/database.sqlite`; MySQL: `mysqldump` en cron
- [ ] **Plan de rollback de migraciones**: guardar el `git tag` desplegado y un dump de la BD *antes* de cada `migrate --force`; rollback = `git checkout <tag> && php artisan migrate:rollback --step=N && restaurar dump`
- [ ] `LOG_LEVEL=error` y rotación de logs (`storage/logs`)
- [ ] Smoke manual: login de un usuario real, crear una cita, abrir una receta PDF, revisar el dashboard

---

## 6. Verificado en este cierre (2026-09-09)

- Suite backend: **180 tests** verde en SQLite y en MariaDB 10.4; seeder demo
  corre limpio en ambos motores.
- `pint` · `tsc` · `lint` · `npm run build` (75/75 páginas) — verde.
- E2E Playwright: `smoke_demo_veterinaria.py` (3 roles), `veterinaria_flujo_clinico.py`
  (12/12), `catalogo_publico.py` — todos verde.
