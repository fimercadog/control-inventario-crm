# E2E — Playwright

Pruebas de navegador de los flujos críticos. Hoy cubre el **catálogo público**.

## Requisitos (una vez)

```bash
pip install playwright
playwright install chromium
```

PHP ≥ 8.4 en el PATH o instalado por winget (`PHP.PHP.*`) — el script lo localiza solo.

## Correr

```bash
python e2e/catalogo_publico.py
```

El script:

1. Corre `php artisan migrate:fresh --seed` + `cache:clear` en `backend/` (⚠️ **borra el SQLite de dev**).
2. Arranca `backend` en `:8001` (`artisan serve`) y compila el `frontend` (`npm run build`)
   y lo sirve en `:3000` (`npm run start`). Si ya los tienes corriendo, los reutiliza.
   Se usa el build de producción a propósito: el doble-fetch de React StrictMode en
   `npm run dev` satura el throttle del backend de un solo proceso.
3. Ejecuta 2 flujos en chromium headless y deja capturas en `e2e/artifacts/` (gitignored).

## Qué verifica `catalogo_publico.py`

| Flujo | Pasos |
| --- | --- |
| **Visitante anónimo** | `/catalogo` → filtro por categoría → abrir ficha → cantidad 3 → "Agregar a cotización" → FAB → `/catalogo/cotizacion` → datos + consentimiento → "Enviar solicitud" → mensaje de éxito |
| **Vendedor en el CRM** | login `admin@andescomercial.co` → `/app/cotizaciones` → fila "Solicitud web —…" con badge **"Sitio web"** + estado **"Borrador"** → detalle con el producto y la cantidad → el cliente existe en `/app/clientes` por su email |

Salida esperada: `E2E OK — capturas en e2e/artifacts/` y código 0.
