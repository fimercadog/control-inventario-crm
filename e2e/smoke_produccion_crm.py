"""
Smoke de la DEMO PÚBLICA de Control de Inventario + CRM — URLs reales.

    FRONT_URL=https://demo-inventario-crm.fidelmercadotech.com \
    API_URL=https://demo-inventario-crm-api.fidelmercadotech.com \
    python e2e/smoke_produccion_crm.py

Verifica: HTTPS, cookie Sanctum, CORS, APP_DEBUG=false, login, dashboard
completo, cada módulo (CRM / Inventario / Analítica / Administración), catálogo
público + solicitud de cotización -> aparece en el CRM, y que NO haya ningún
módulo veterinario.
"""

from __future__ import annotations

import os
import re
import ssl
import sys
import time
import urllib.request
import uuid
from pathlib import Path

from playwright.sync_api import Page, expect, sync_playwright

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

FRONT_URL = os.environ.get("FRONT_URL", "https://demo-inventario-crm.fidelmercadotech.com").rstrip("/")
API_URL = os.environ.get("API_URL", "https://demo-inventario-crm-api.fidelmercadotech.com").rstrip("/")
ARTIFACTS = Path(__file__).resolve().parent / "artifacts"

results: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    results.append((name, ok, detail))
    print(f"  [{'OK' if ok else 'FALLA'}] {name}{' — ' + detail if detail else ''}")


def shot(page: Page, name: str) -> None:
    page.screenshot(path=ARTIFACTS / f"prodcrm-{name}.png", full_page=True)


def dismiss_beta(page: Page) -> None:
    page.wait_for_load_state("networkidle")
    try:
        b = page.get_by_role("button", name="Entendido")
        b.wait_for(state="visible", timeout=4000)
        b.click()
        b.wait_for(state="hidden", timeout=5000)
    except Exception:
        pass


MODULES = [
    # (label en el menú, ruta, texto esperado en la página)
    ("Leads", "/app/leads", "Leads"),
    ("Clientes", "/app/clientes", "Clientes"),
    ("Contactos", "/app/contactos", "Contactos"),
    ("Segmentos", "/app/segmentos", "Segmentos"),
    ("Notas", "/app/notas", "Notas"),
    ("Deals", "/app/deals", "Deals"),
    ("Cotizaciones", "/app/cotizaciones", "Cotizaciones"),
    ("Actividades", "/app/actividades", "Actividades"),
    ("Tareas", "/app/tareas", "Tareas"),
    ("Seguimientos", "/app/seguimientos", "Seguimientos"),
    ("Calendario", "/app/calendario", "Calendario"),
    ("Pedidos", "/app/pedidos", "Pedidos"),
    ("Productos", "/app/productos", "Productos"),
    ("Categorias", "/app/categorias", "Categor"),
    ("Marcas", "/app/marcas", "Marcas"),
    ("Unidades", "/app/unidades", "Unidades"),
    ("Bodegas", "/app/bodegas", "Bodegas"),
    ("Movimientos", "/app/movimientos-inventario", "Movimientos"),
    ("Transferencias", "/app/transferencias", "Transferencias"),
    ("Alertas de stock", "/app/alertas-stock", "stock"),
    ("Proveedores", "/app/proveedores", "Proveedores"),
    ("Ordenes de compra", "/app/ordenes-compra", "compra"),
    ("Reportes", "/app/reportes", "Reportes"),
    ("Reportes comerciales", "/app/reportes-comerciales", "comerciales"),
    ("Auditoria", "/app/auditoria", "Auditor"),
    ("Usuarios", "/app/usuarios", "Usuarios"),
    ("Roles", "/app/roles", "Roles"),
]


def main() -> int:  # noqa: C901
    ARTIFACTS.mkdir(exist_ok=True)
    for stale in ARTIFACTS.glob("prodcrm-*.png"):
        stale.unlink()
    print(f"· Front: {FRONT_URL}\n· API:   {API_URL}")

    # HTTPS / certificado
    print("· HTTPS")
    for label, url in (("frontend", FRONT_URL), ("api", f"{API_URL}/api/public/catalog/categories")):
        try:
            r = urllib.request.urlopen(url, timeout=20, context=ssl.create_default_context())
            check(f"HTTPS válido ({label})", url.startswith("https://") and r.status == 200, str(r.status))
        except Exception as e:
            check(f"HTTPS válido ({label})", False, str(e)[:120])

    tag = uuid.uuid4().hex[:6]
    quote_email = f"smoke-crm-{tag}@ejemplo.co"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1400, "height": 2400}, locale="es-CO")
        page = ctx.new_page()
        cors: dict = {}
        page.on("response", lambda r: cors.update({
            "acao": r.headers.get("access-control-allow-origin", ""),
            "acac": r.headers.get("access-control-allow-credentials", ""),
        }) if "/api/" in r.url and r.request.method != "OPTIONS" else None)
        page.on("response", lambda r: (
            print(f"  [{r.status}] {r.request.method} {r.url}") if "/api/" in r.url and r.status >= 400 else None
        ))

        # 1 -- catálogo público -> cotización -----------------------------
        print("· 1. catálogo público -> solicitud de cotización")
        page.goto(f"{FRONT_URL}/catalogo")
        page.wait_for_load_state("networkidle")
        card = page.locator('a[href^="/catalogo/"]').first
        expect(card).to_be_visible(timeout=20000)
        card.click()
        page.wait_for_url(re.compile(r"/catalogo/\d+$"))
        product_name = page.locator("h1").first.inner_text().strip()
        page.locator('input[type="number"]').first.fill("2")
        page.get_by_role("button", name=re.compile("Agregar a cotiza")).click()
        page.get_by_role("link", name=re.compile("Ver cotiza")).click()
        page.wait_for_url("**/catalogo/cotizacion")
        page.get_by_placeholder("Nombre").fill(f"Prospecto CRM {tag}")
        page.get_by_placeholder("Empresa").fill("Empresa Smoke")
        page.get_by_placeholder("Email").fill(quote_email)
        page.get_by_placeholder("WhatsApp").fill("3001234567")
        page.get_by_role("checkbox").check()
        page.get_by_role("button", name="Enviar solicitud").click()
        expect(page.get_by_text(re.compile("Recibimos tu solicitud"))).to_be_visible(timeout=15000)
        shot(page, "01-cotizacion-enviada")
        check("Catálogo público: solicitud de cotización enviada", True, f"producto: {product_name}")

        # 2 -- login -----------------------------------------------------
        print("· 2. login Super Admin")
        page.goto(f"{FRONT_URL}/login")
        page.wait_for_load_state("networkidle")
        page.get_by_placeholder("Email").fill("superadmin@andescomercial.co")
        page.get_by_placeholder("Contraseña").fill("password")
        page.get_by_role("button", name="Entrar al panel").click()
        page.wait_for_url("**/app/**", timeout=25000)
        dismiss_beta(page)
        cookies = {c["name"] for c in ctx.cookies()}
        check("Login OK + cookie de sesión Sanctum",
              any("session" in c.lower() for c in cookies) or "XSRF-TOKEN" in cookies,
              ", ".join(sorted(cookies)))
        check("Cookies Secure",
              all(c.get("secure") for c in ctx.cookies() if "session" in c["name"].lower() or c["name"] == "XSRF-TOKEN"), "")

        # 3 -- dashboard completo -------------------------------------
        print("· 3. dashboard completo")
        page.goto(f"{FRONT_URL}/app/dashboard")
        dismiss_beta(page)
        # el dashboard carga /api/dashboard async: esperar a que aparezcan datos
        expect(page.get_by_text("Ingresos del mes", exact=False)).to_be_visible(timeout=25000)
        page.wait_for_timeout(3000)
        m = page.get_by_role("main").inner_text().lower()
        for w in ("deals abiertos", "deals ganados", "compra", "pipeline por etapa", "embudo de ventas",
                  "deals ganados vs perdidos", "top productos", "actividad reciente", "stock bajo",
                  "ingresos del mes", "clientes"):
            check(f"Dashboard: '{w}'", w in m, "")
        shot(page, "02-dashboard")

        # 4 -- cada módulo del menú -----------------------------------
        print("· 4. módulos (menú + página cargan)")
        nav = page.get_by_role("navigation").first.inner_text()
        for label, route, expect_text in MODULES:
            in_menu = label in nav
            page.goto(f"{FRONT_URL}{route}")
            dismiss_beta(page)
            body = page.get_by_role("main").inner_text()
            denied = "No tienes acceso" in body
            loads = (expect_text.lower() in body.lower()) and not denied
            check(f"Módulo {label}", in_menu and loads, "no en menú" if not in_menu else ("acceso denegado" if denied else "" if loads else "no cargó"))
        shot(page, "03-ultimo-modulo")

        # 5 -- la cotización pública aparece en el CRM ----------------
        print("· 5. la solicitud aparece en Cotizaciones")
        page.goto(f"{FRONT_URL}/app/cotizaciones")
        dismiss_beta(page)
        row = page.get_by_role("row").filter(has_text=f"Prospecto CRM {tag}")
        expect(row).to_be_visible(timeout=15000)
        check("Cotización del sitio visible en el CRM (borrador)", "orrador" in row.inner_text() or "itio web" in row.inner_text())
        page.goto(f"{FRONT_URL}/app/clientes")
        dismiss_beta(page)
        page.get_by_placeholder("Buscar...").fill(quote_email) if page.get_by_placeholder("Buscar...").count() else None
        expect(page.get_by_text(quote_email)).to_be_visible(timeout=15000)
        check("El prospecto quedó como cliente en el CRM", True)
        shot(page, "04-cotizacion-en-crm")

        # 6 -- NADA veterinario -------------------------------------
        print("· 6. sin rastro veterinario")
        vet_hits = []
        for route in ("/app/pacientes", "/app/citas", "/app/vacunas", "/app/consultas", "/app/reportes-clinicos"):
            r = page.request.get(f"{API_URL}/api{route.replace('/app', '')}")
            if r.status not in (404, 401, 403):
                vet_hits.append(f"{route}={r.status}")
        nav_vet = any(w in nav.lower() for w in ("paciente", "mascota", "vacuna", "veterinar", "clínica", "consulta soap"))
        check("Sin módulos veterinarios (menú)", not nav_vet)
        check("Sin endpoints veterinarios en la API", not vet_hits, ", ".join(vet_hits))

        # 7 -- seguridad -------------------------------------------
        print("· 7. seguridad")
        check("CORS Allow-Credentials", cors.get("acac", "").lower() == "true", cors.get("acac", "(vacío)"))
        check("CORS Allow-Origin = front", cors.get("acao", "").rstrip("/") == FRONT_URL, cors.get("acao", "(vacío)"))
        r = page.request.get(f"{API_URL}/api/no-existe-{tag}")
        leak = "Whoops" in r.text() or "vendor/laravel/framework" in r.text()
        check("APP_DEBUG=false (404 sin stack trace)", not leak, f"status {r.status}")
        for path in ("/.env", "/../.env"):
            if "APP_KEY" in page.request.get(f"{API_URL}{path}").text():
                check(".env no accesible", False, path)
                break
        else:
            check(".env no accesible", True)

        browser.close()

    print()
    failed = [n for n, ok, _ in results if not ok]
    print(f"=== {len(results) - len(failed)}/{len(results)} checks OK ===")
    if failed:
        print("FALLAS:")
        for n in failed:
            print(f"  - {n}")
        return 1
    print("SMOKE PRODUCCIÓN CRM + INVENTARIO OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
