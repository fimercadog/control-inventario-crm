# E2E — Playwright (vertical veterinaria)

Pruebas de navegador de los flujos críticos.

## Requisitos (una vez)

```bash
pip install playwright
playwright install chromium
```

PHP ≥ 8.4 en el PATH o instalado por winget (`PHP.PHP.*`) — el script lo localiza solo.

## Scripts

| Script | Qué verifica |
| --- | --- |
| `python e2e/smoke_demo_veterinaria.py` | **Smoke de la demo.** Login Super Admin / Veterinario/a / Recepción · separación de permisos (Recepción no llega a historia clínica ni recetas) · Pacientes · Agenda · Historia clínica · registrar una cita · abrir una receta en PDF · Dashboard (fila Clínica) · Reportes clínicos · portal público "Solicita tu cita". |
| `python e2e/veterinaria_flujo_clinico.py` | **Flujo clínico completo (12 pasos).** `/solicitar-cita` → Lead(source=appointment) → recepción → propietario → paciente → cita (verifica hora sin corrimiento de zona) → confirmar → atendida → consulta SOAP → vacuna con producto (descuenta stock) → receta + PDF real → dashboard → reportes clínicos. Navegador en zona `America/Bogota`. |
| `python e2e/catalogo_publico.py` | **Catálogo público.** `/catalogo` → filtro por categoría → ficha → "Agregar a cotización" → `/catalogo/cotizacion` → enviar → aparece en `/app/cotizaciones` como borrador con badge "Sitio web"; el propietario queda creado. |

## Cómo corren

1. `php artisan migrate:fresh --seed` + `cache:clear` en `backend/` (⚠️ **borra el SQLite de dev**).
2. Arrancan `backend` en `:8001` (`artisan serve`) y compilan el `frontend`
   (`npm run build`) sirviéndolo en `:3000` (`npm run start`). Si ya están
   corriendo, los reutilizan. Build de producción a propósito: el doble-fetch de
   React StrictMode en `npm run dev` satura el throttle del backend de un proceso.
3. Ejecutan en chromium headless y dejan capturas en `e2e/artifacts/` (gitignored).

Salida esperada de cada uno: una línea `... OK` y código de salida 0.
