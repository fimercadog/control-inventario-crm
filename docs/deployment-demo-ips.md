# GATE DE DESPLIEGUE DEMO · VERTICAL IPS (`NOVA IPS`)

Este documento especifica los requisitos de infraestructura, variables de entorno de producción demo, arquitectura de dominios, comandos de primera instalación vs. actualización posterior, y políticas de protección de datos para el despliegue de la vertical **NOVA IPS**.

---

## 1. REQUISITOS DE INFRAESTRUCTURA & SERVIDOR

- **Servidor Web / VPS:** Ubuntu 22.04 LTS / Debian 12 o hosting PHP 8.2+ con Node.js 18+ LTS.
- **PHP Extensions Requeridas:** `pdo_sqlite`, `mbstring`, `openssl`, `curl`, `json`, `fileinfo`, `xml`, `tokenizer`.
- **Node.js Environment:** Node.js v18.x o v20.x, `npm` v9+.
- **Procesador & RAM Mínimos:** 1 vCPU, 2 GB RAM (recomendado 4 GB RAM si se compila Next.js en el mismo servidor).

---

## 2. ESTRUCTURA DE DOMINIOS & SSL (HTTPS)

Para el despliegue aislado de la demo sin interferir con la vertical `erp` o `veterinaria`:

| Componente | Dominio Producción Demo (Ejemplo) | Puerto / Destino Interno |
|---|---|---|
| **Frontend Next.js** | `https://demo-ips.fidelmercadotech.com` | `http://127.0.0.1:3000` |
| **Backend API Laravel** | `https://api-demo-ips.fidelmercadotech.com` | `http://127.0.0.1:8001` (o FPM) |

> **IMPORTANTE:** Ambos subdominios deben contar con certificado SSL (HTTPS) activo antes de habilitar autenticación Sanctum por cookies y CORS.

---

## 3. VARIABLES DE ENTORNO EN SERVIDOR PRODUCCIÓN DEMO

### A. Frontend Next.js (`frontend/.env.local` en Servidor)

```env
# URL de la API Laravel con prefijo /api y HTTPS obligatorio
NEXT_PUBLIC_API_URL=https://api-demo-ips.fidelmercadotech.com/api

# URL pública del Frontend demo
NEXT_PUBLIC_SITE_URL=https://demo-ips.fidelmercadotech.com

# Activar atajos demo en pantalla de login / acceso rápido
NEXT_PUBLIC_DEMO_MODE=true

# Plan comercial (Vacío = Demo completo Full IPS)
NEXT_PUBLIC_PLAN=
```

### B. Backend Laravel (`backend/.env` en Servidor)

```env
APP_NAME="NOVA IPS ERP"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api-demo-ips.fidelmercadotech.com

# Clave de encriptación generada exclusivamente en el servidor (NUNCA incluir en Git)
# php artisan key:generate
APP_KEY=base64:SERVIDORDEMOKEYGENERATED1234567890123456=

# Configuración de Sanctum & CORS para dominios separados
SANCTUM_STATEFUL_DOMAINS=demo-ips.fidelmercadotech.com
SESSION_DOMAIN=.fidelmercadotech.com

# Base de datos SQLite demo usando RUTA ABSOLUTA REAL DEL VPS
DB_CONNECTION=sqlite
DB_DATABASE=/home/usuario/apps/ips/backend/database/database.sqlite

SESSION_DRIVER=database
SESSION_LIFETIME=120
QUEUE_CONNECTION=sync
```

---

## 4. PERMISOS DE ARCHIVOS EN SERVIDOR (SQLite & Storage)

Para evitar errores `500 Server Error` o `Permission Denied` al escribir en la base SQLite y almacenamiento de archivos:

```bash
# Otorgar permisos de escritura al usuario del servidor web (www-data / nginx / apache)
cd /home/usuario/apps/ips/backend

sudo chown -R www-data:www-data storage database
sudo chmod -R 775 storage database
sudo chmod 664 database/database.sqlite
```

---

## 5. GUÍA DE DEPLOYMENT: PRIMERA INSTALACIÓN VS. ACTUALIZACIÓN POSTERIOR

### ⚠️ Regla de Oro: "Ship the demo, protect the base"
Nunca ejecutar `migrate:fresh` sobre una demo desplegada que contenga datos generados en vivo por usuarios.

#### A. Primera Instalación (Demo Vacía desde Cero)

```bash
cd /home/usuario/apps/ips/backend

# 1. Asegurar la creación del archivo sqlite vacío si no existe
touch database/database.sqlite

# 2. Generar App Key de producción
php artisan key:generate --force

# 3. Crear tablas e instalar datos iniciales demo por ÚNICA vez
php artisan migrate:fresh --seed --force

# 4. Optimizar cachés de Laravel para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### B. Actualizaciones Posteriores (Deploy Incremental de Cambios)

```bash
cd /home/usuario/apps/ips/backend

# 1. Aplicar nuevas migraciones SIN borrar datos ni tablas existentes
php artisan migrate --force

# 2. Re-cachear configuración
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 6. COMANDOS DE BUILD & SERVICIO (NEXT.JS & LARAVEL)

### Frontend Next.js (Servidor)

```bash
cd /home/usuario/apps/ips/frontend

# 1. Instalar dependencias de producción
npm ci

# 2. Ejecutar verificación de pruebas
npx vitest run

# 3. Compilar build optimizado
npm run build

# 4. Iniciar proceso en segundo plano con PM2
pm2 start npm --name "ips-frontend" -- start -- -p 3000
```

### Backend Laravel API (Servidor)

```bash
cd /home/usuario/apps/ips/backend

# 1. Ejecutar suite de pruebas PHPUnit
php artisan test

# 2. Enlazar storage público para imágenes
php artisan storage:link
```

---

## 7. PLAN DE ROLLBACK DE EMERGENCIA

Si un despliegue presenta inconvenientes en producción:

1. **Rollback de Frontend:**
   ```bash
   pm2 restart ips-frontend
   # O en Vercel/Railway: promover el deployment previo desde el dashboard
   ```
2. **Rollback de Base de Datos / Backend:**
   ```bash
   cd /home/usuario/apps/ips/backend
   php artisan migrate:rollback --step=1 --force
   ```
3. **Backup de SQLite:**
   Se recomienda respaldar periódicamente el archivo `database.sqlite` mediante cron:
   ```bash
   cp /home/usuario/apps/ips/backend/database/database.sqlite /home/usuario/backups/database-$(date +%F-%H%M).sqlite
   ```

---

## 8. REGISTRO DE VERIFICACIÓN LOCAL PRE-DEPLOYMENT

- **Rama Git:** `ips` (independiente de `erp`).
- **PHPUnit Tests:** `253 passed` (934 assertions).
- **Vitest Tests:** `32 passed` (7 test files).
- **Next.js Build:** `92/92 routes compiled successfully`.
