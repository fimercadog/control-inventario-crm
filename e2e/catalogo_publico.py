"""
E2E del catálogo público: sitio -> catálogo -> ficha -> solicitar cotización -> CRM.

Levanta backend (:8001) y frontend (:3000) si no están corriendo, corre dos
flujos con Playwright (chromium headless) y deja capturas en e2e/artifacts/.

    python e2e/catalogo_publico.py

Requisitos: pip install playwright && playwright install chromium
"""

from __future__ import annotations

import glob
import os
import re
import subprocess
import sys
import time
import urllib.request
import uuid
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

# Windows: la consola/redireccion por defecto es cp1252 y revienta al imprimir
# "✓" o acentos (UnicodeEncodeError). Forzar UTF-8 en la salida sin depender de
# que se exporte PYTHONIOENCODING a mano.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
ARTIFACTS = Path(__file__).resolve().parent / "artifacts"

FRONT_URL = "http://localhost:3000"
API_URL = "http://localhost:8001"


def php() -> str:
    hits = glob.glob(
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.*\php.exe")
    )
    for candidate in [*hits, "php"]:
        try:
            out = subprocess.run([candidate, "-r", "echo PHP_VERSION_ID;"], capture_output=True, text=True)
            if out.stdout.strip().isdigit() and int(out.stdout.strip()) >= 80400:
                return candidate
        except OSError:
            continue
    sys.exit("No se encontró PHP >= 8.4")


def up(url: str) -> bool:
    try:
        urllib.request.urlopen(url, timeout=2)
        return True
    except Exception:
        return False


def wait_for(url: str, label: str, timeout: int = 120) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if up(url):
            print(f"  {label} listo")
            return
        time.sleep(2)
    sys.exit(f"Timeout esperando {label} ({url})")


def main() -> int:
    ARTIFACTS.mkdir(exist_ok=True)
    for stale in ARTIFACTS.glob("*.png"):
        stale.unlink()

    procs: list[subprocess.Popen] = []
    php_bin = php()

    print("· migrate:fresh --seed (+ cache:clear para resetear rate limits)")
    subprocess.run([php_bin, "artisan", "migrate:fresh", "--seed", "--no-interaction"],
                   cwd=BACKEND, check=True)
    subprocess.run([php_bin, "artisan", "cache:clear"], cwd=BACKEND, check=True)

    if not up(f"{API_URL}/api/public/catalog/categories"):
        print("· arrancando backend :8001")
        procs.append(subprocess.Popen([php_bin, "artisan", "serve", "--port=8001"], cwd=BACKEND))
    if not up(FRONT_URL):
        # Build de produccion: sin el doble-fetch de React StrictMode en dev,
        # que satura el throttle del backend de un solo proceso.
        print("· build de produccion del frontend")
        subprocess.run("npm run build", cwd=FRONTEND, shell=True, check=True)
        print("· arrancando frontend :3000")
        procs.append(subprocess.Popen("npm run start -- --port 3000", cwd=FRONTEND, shell=True))

    try:
        wait_for(f"{API_URL}/api/public/catalog/categories", "backend")
        wait_for(FRONT_URL, "frontend")

        email = f"e2e-{uuid.uuid4().hex[:8]}@ejemplo.co"
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            # Solo ruido util: escrituras y errores de API.
            page.on("request", lambda r: print(f"  -> {r.method} {r.url}") if "/api/" in r.url and r.method != "GET" else None)
            page.on("response", lambda r: (
                print(f"  [{r.status}] {r.request.method} {r.url}")
                if "/api/" in r.url and (r.status >= 400 or r.request.method != "GET")
                else None
            ))
            page.on("console", lambda m: print(f"  [console:{m.type}] {m.text}") if m.type in ("error", "warning") else None)

            # ---- Flujo 1: visitante anónimo arma y envía la cotización ----
            print("· flujo público")
            page.goto(f"{FRONT_URL}/catalogo")
            page.wait_for_load_state("networkidle")
            expect(page.get_by_role("button", name="Electronica")).to_be_visible(timeout=30000)
            page.get_by_role("button", name="Electronica").click()
            page.wait_for_load_state("networkidle")
            first_card = page.locator('a[href^="/catalogo/"]').first
            expect(first_card).to_be_visible(timeout=15000)
            page.screenshot(path=ARTIFACTS / "01-catalogo.png", full_page=True)
            first_card.click()

            page.wait_for_url(re.compile(r"/catalogo/\d+$"))
            expect(page.get_by_role("button", name="Agregar a cotizacion")).to_be_visible(timeout=30000)
            product_name = page.locator("h1").first.inner_text().strip()
            print(f"  producto: {product_name}")
            qty = page.locator('input[type="number"]').first
            qty.fill("3")
            page.get_by_role("button", name="Agregar a cotizacion").click()
            fab = page.get_by_role("link", name=re.compile("Ver cotizacion"))
            expect(fab).to_be_visible(timeout=10000)
            page.screenshot(path=ARTIFACTS / "02-ficha.png", full_page=True)
            fab.click()

            page.wait_for_url("**/catalogo/cotizacion")
            page.get_by_placeholder("Nombre").fill("Cliente E2E")
            page.get_by_placeholder("Empresa").fill("Empresa E2E")
            page.get_by_placeholder("Email").fill(email)
            page.get_by_placeholder("WhatsApp").fill("3001234567")
            page.get_by_placeholder("Detalles: plazo de entrega, ciudad, condiciones...").fill(
                "Solicitud generada por la prueba E2E."
            )
            page.get_by_role("checkbox").check()
            page.screenshot(path=ARTIFACTS / "03-cotizacion.png", full_page=True)
            page.get_by_role("button", name="Enviar solicitud").click()
            try:
                expect(page.get_by_text("Recibimos tu solicitud de cotizacion")).to_be_visible(timeout=15000)
            except AssertionError:
                page.screenshot(path=ARTIFACTS / "99-fallo-envio.png", full_page=True)
                raise
            page.screenshot(path=ARTIFACTS / "04-exito.png", full_page=True)
            print("  ✓ solicitud enviada")

            # ---- Flujo 2: el vendedor la ve en el CRM ----
            print("· verificación en el CRM")
            page.goto(f"{FRONT_URL}/login")
            page.wait_for_load_state("networkidle")
            page.get_by_placeholder("Email").fill("admin@andescomercial.co")
            page.get_by_placeholder("Contraseña").fill("password")
            page.get_by_role("button", name="Entrar al panel").click()
            try:
                page.wait_for_url("**/app/**", timeout=20000)
            except Exception:
                page.screenshot(path=ARTIFACTS / "98-fallo-login.png", full_page=True)
                print(f"  url actual: {page.url}")
                raise

            # El panel abre con un modal de bienvenida ("Beta"); cerrarlo.
            def dismiss_beta():
                page.wait_for_load_state("networkidle")
                btn = page.get_by_role("button", name="Entendido")
                try:
                    btn.wait_for(state="visible", timeout=4000)
                    btn.click()
                    btn.wait_for(state="hidden", timeout=5000)
                except Exception:
                    pass

            dismiss_beta()

            try:
                page.goto(f"{FRONT_URL}/app/cotizaciones")
                dismiss_beta()
                row = page.get_by_role("row").filter(has_text="Cliente E2E")
                expect(row).to_be_visible(timeout=15000)
                expect(row.get_by_text("Sitio web")).to_be_visible()
                expect(row.get_by_text("Borrador")).to_be_visible()
                page.screenshot(path=ARTIFACTS / "05-crm-cotizaciones.png", full_page=True)

                row.get_by_role("link", name="Ver").click()
                page.wait_for_url(re.compile(r"/app/cotizaciones/\d+$"))
                page.wait_for_load_state("networkidle")
                expect(page.get_by_text(product_name).first).to_be_visible(timeout=15000)
                page.screenshot(path=ARTIFACTS / "06-crm-detalle.png", full_page=True)

                page.goto(f"{FRONT_URL}/app/clientes")
                page.wait_for_load_state("networkidle")
                expect(page.get_by_text(email)).to_be_visible(timeout=15000)
                page.screenshot(path=ARTIFACTS / "07-crm-cliente.png", full_page=True)

                # Productos: la tabla debe renderizar y la accion "Imagen" existir.
                page.goto(f"{FRONT_URL}/app/productos")
                dismiss_beta()
                expect(page.get_by_role("row").filter(has_text="Monitor")).to_be_visible(timeout=15000)
                expect(page.get_by_role("button", name="Imagen").first).to_be_visible()
                page.screenshot(path=ARTIFACTS / "08-crm-productos.png", full_page=True)
                print("  ✓ cotización + cliente + tabla de productos en el CRM")
            except AssertionError:
                page.screenshot(path=ARTIFACTS / "97-fallo-crm.png", full_page=True)
                print(f"  url actual: {page.url}")
                raise

            browser.close()
        print("\nE2E OK — capturas en e2e/artifacts/")
        return 0
    finally:
        for proc in procs:
            if os.name == "nt":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                               capture_output=True)
            else:
                proc.terminate()


if __name__ == "__main__":
    raise SystemExit(main())
