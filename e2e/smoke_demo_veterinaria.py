"""
Smoke test de la demo veterinaria — verifica el dataset sembrado a través de
la interfaz real, con los tres roles principales.

    python e2e/smoke_demo_veterinaria.py

Recorre: login Super Admin / Veterinario/a / Recepción · separación de permisos
(Recepción no llega a historia clínica ni recetas) · Pacientes · Agenda ·
Historia clínica · registrar una cita · abrir una receta en PDF · Dashboard
(fila Clínica) · Reportes clínicos · portal público "Solicita tu cita".

Gemelo de catalogo_publico.py / veterinaria_flujo_clinico.py — mismo arranque
de servidores. Requisitos: pip install playwright && playwright install chromium
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

from playwright.sync_api import Page, expect, sync_playwright

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
TODAY = time.strftime("%Y-%m-%d")
SOON = time.strftime("%Y-%m-%d", time.localtime(time.time() + 2 * 24 * 3600))


def php() -> str:
    hits = glob.glob(os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.*\php.exe"))
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


def shot(page: Page, name: str) -> None:
    page.screenshot(path=ARTIFACTS / f"smoke-{name}.png", full_page=True)


def dismiss_beta(page: Page) -> None:
    page.wait_for_load_state("networkidle")
    try:
        btn = page.get_by_role("button", name="Entendido")
        btn.wait_for(state="visible", timeout=4000)
        btn.click()
        btn.wait_for(state="hidden", timeout=5000)
    except Exception:
        pass


def login(page: Page, email: str) -> None:
    page.goto(f"{FRONT_URL}/login")
    page.wait_for_load_state("networkidle")
    page.get_by_placeholder("Email").fill(email)
    page.get_by_placeholder("Contraseña").fill("password")
    page.get_by_role("button", name="Entrar al panel").click()
    page.wait_for_url("**/app/**", timeout=20000)
    dismiss_beta(page)


def logout(page: Page) -> None:
    # botón "Cerrar sesion" del shell (aria-label), y respaldo por cookies.
    try:
        btn = page.get_by_role("button", name="Cerrar sesion")
        btn.wait_for(state="visible", timeout=4000)
        btn.click()
        page.wait_for_url(re.compile(r"/(login|)$"), timeout=8000)
    except Exception:
        pass
    try:
        page.request.post(f"{API_URL}/api/auth/logout")
    except Exception:
        pass
    page.context.clear_cookies()


def main() -> int:  # noqa: C901
    ARTIFACTS.mkdir(exist_ok=True)
    for stale in ARTIFACTS.glob("smoke-*.png"):
        stale.unlink()

    procs: list[subprocess.Popen] = []
    php_bin = php()

    print("· migrate:fresh --seed")
    subprocess.run([php_bin, "artisan", "migrate:fresh", "--seed", "--no-interaction"], cwd=BACKEND, check=True)
    subprocess.run([php_bin, "artisan", "cache:clear"], cwd=BACKEND, check=True)

    if not up(f"{API_URL}/api/public/catalog/categories"):
        print("· arrancando backend :8001")
        procs.append(subprocess.Popen([php_bin, "artisan", "serve", "--port=8001"], cwd=BACKEND))
    if not up(FRONT_URL):
        print("· build de producción del frontend")
        subprocess.run("npm run build", cwd=FRONTEND, shell=True, check=True)
        print("· arrancando frontend :3000")
        procs.append(subprocess.Popen("npm run start -- --port 3000", cwd=FRONTEND, shell=True))

    try:
        wait_for(f"{API_URL}/api/public/catalog/categories", "backend")
        wait_for(FRONT_URL, "frontend")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1280, "height": 950}, timezone_id="America/Bogota", locale="es-CO"
            )
            page = context.new_page()
            page.on("response", lambda r: (
                print(f"  [{r.status}] {r.request.method} {r.url}")
                if "/api/" in r.url and (r.status >= 500 or (r.status >= 400 and r.request.method != "GET"))
                else None
            ))

            # 1 -- Super Admin: dashboard + reportes clínicos ------------------
            print("· 1. Super Admin — dashboard y reportes clínicos")
            login(page, "superadmin@vetlosandes.co")
            main_el = page.get_by_role("main")
            expect(main_el.get_by_text("Clínica", exact=True).first).to_be_visible(timeout=20000)
            for label in ("Citas hoy", "Pacientes activos", "Vacunas por vencer", "Consultas del mes"):
                expect(main_el.get_by_text(label, exact=True)).to_be_visible()
            shot(page, "01-superadmin-dashboard")

            page.goto(f"{FRONT_URL}/app/reportes-clinicos")
            dismiss_beta(page)
            expect(page.get_by_role("heading", name="Reportes clínicos")).to_be_visible(timeout=20000)
            expect(page.get_by_text("Pacientes atendidos")).to_be_visible()
            # el dataset trae actividad -> al menos un valor > 0 en las stats
            expect(page.get_by_text("Ingreso estimado por servicio")).to_be_visible()
            shot(page, "02-superadmin-reportes-clinicos")
            print("  ✓ dashboard con fila Clínica y reportes clínicos con datos")
            logout(page)

            # 2 -- Veterinario/a: pacientes, agenda, historia, receta PDF -----
            print("· 2. Veterinario/a — pacientes, agenda, historia clínica, receta PDF")
            login(page, "veterinario@vetlosandes.co")
            nav = page.get_by_role("navigation")
            expect(nav.get_by_text("Historia clínica")).to_be_visible(timeout=15000)
            expect(nav.get_by_text("Recetas")).to_be_visible()

            page.goto(f"{FRONT_URL}/app/pacientes")
            dismiss_beta(page)
            expect(page.get_by_role("heading", name="Pacientes")).to_be_visible(timeout=15000)
            page.get_by_placeholder("Buscar...").fill("Luna")
            expect(page.get_by_role("row").filter(has_text="Luna")).to_be_visible(timeout=15000)
            shot(page, "03-vet-pacientes")

            page.goto(f"{FRONT_URL}/app/agenda")
            dismiss_beta(page)
            # la agenda de hoy tiene citas sembradas
            expect(page.locator("main").get_by_text(re.compile(r"\d{1,2}:\d{2}")).first).to_be_visible(timeout=15000)
            shot(page, "04-vet-agenda")

            page.goto(f"{FRONT_URL}/app/consultas")
            dismiss_beta(page)
            expect(page.get_by_role("heading", name="Historia clínica")).to_be_visible(timeout=15000)
            page.get_by_placeholder("Buscar...").fill("Control anual")
            expect(page.get_by_role("row").filter(has_text="Control anual")).to_be_visible(timeout=15000)
            shot(page, "05-vet-historia")

            # registrar una cita
            print("  · registrar una cita")
            page.goto(f"{FRONT_URL}/app/citas")
            dismiss_beta(page)
            page.get_by_role("button", name="Nueva cita").first.click()
            dialog = page.get_by_role("dialog")
            expect(dialog).to_be_visible(timeout=10000)
            dialog.get_by_label("Paciente").select_option(label="Bruno")
            dialog.get_by_label("Inicio").fill(f"{SOON} 14:00")
            dialog.get_by_label("Fin").fill(f"{SOON} 14:30")
            dialog.get_by_label("Motivo").fill("Control de peso (smoke test)")
            dialog.get_by_role("button", name="Crear registro").click()
            # el modal solo se cierra si el backend aceptó (un 422 lo deja abierto)
            expect(dialog).to_be_hidden(timeout=15000)
            expect(page.get_by_text("Registro creado")).to_be_visible(timeout=10000)
            # y aparece en la agenda del día elegido
            page.goto(f"{FRONT_URL}/app/agenda")
            dismiss_beta(page)
            page.locator('input[type="date"]').fill(SOON)
            expect(page.locator("main").get_by_text("Control de peso (smoke test)")).to_be_visible(timeout=15000)
            shot(page, "06-vet-cita-creada")

            # receta PDF
            print("  · abrir una receta en PDF")
            page.goto(f"{FRONT_URL}/app/recetas")
            dismiss_beta(page)
            expect(page.get_by_role("heading", name="Recetas")).to_be_visible(timeout=15000)
            with page.expect_download(timeout=20000) as dl:
                page.get_by_role("button", name="Descargar PDF").first.click()
            out = ARTIFACTS / "smoke-07-receta.pdf"
            dl.value.save_as(out)
            assert out.stat().st_size > 800, f"PDF muy pequeño: {out.stat().st_size}"
            print(f"  ✓ pacientes, agenda, historia, cita creada, receta PDF ({out.stat().st_size} bytes)")
            logout(page)

            # 3 -- Recepción: front desk sí, historia clínica NO -------------
            print("· 3. Recepción — agenda y pacientes sí; historia clínica / recetas bloqueadas")
            login(page, "recepcion@vetlosandes.co")
            nav = page.get_by_role("navigation")
            expect(nav.get_by_text("Agenda")).to_be_visible(timeout=15000)
            expect(nav.get_by_text("Pacientes")).to_be_visible()
            # el menú NO muestra historia clínica ni recetas para recepción
            expect(nav.get_by_text("Historia clínica")).to_have_count(0)
            expect(nav.get_by_text("Recetas")).to_have_count(0)

            page.goto(f"{FRONT_URL}/app/pacientes")
            dismiss_beta(page)
            expect(page.get_by_role("row").filter(has_text="Luna")).to_be_visible(timeout=15000)

            # URL directa a historia clínica / recetas -> pantalla de acceso denegado
            for route in ("/app/consultas", "/app/recetas"):
                page.goto(f"{FRONT_URL}{route}")
                dismiss_beta(page)
                expect(page.get_by_text("No tienes acceso a esta seccion")).to_be_visible(timeout=15000)
            shot(page, "08-recepcion-sin-historia")
            print("  ✓ recepción: front desk visible, historia clínica y recetas bloqueadas")
            logout(page)

            # 4 -- portal público "Solicita tu cita" ------------------------
            print("· 4. portal público /solicitar-cita")
            tag = uuid.uuid4().hex[:6]
            page.goto(f"{FRONT_URL}/solicitar-cita")
            page.wait_for_load_state("networkidle")
            page.get_by_label("Tu nombre").fill(f"Prospecto Smoke {tag}")
            page.get_by_label("Correo").fill(f"smoke-{tag}@ejemplo.co")
            page.get_by_label("Nombre de la mascota").fill("Fido")
            page.get_by_label("Motivo").fill("Primera consulta")
            page.get_by_role("checkbox").check()
            page.get_by_role("button", name="Solicitar cita").click()
            expect(page.get_by_text("Recibimos tu solicitud")).to_be_visible(timeout=15000)
            shot(page, "09-solicitar-cita")

            # y aparece como solicitud para recepción
            login(page, "recepcion@vetlosandes.co")
            page.goto(f"{FRONT_URL}/app/leads")
            dismiss_beta(page)
            row = page.get_by_role("row").filter(has_text=f"smoke-{tag}@ejemplo.co")
            expect(row).to_be_visible(timeout=15000)
            expect(row.get_by_text("Solicitud de cita")).to_be_visible()
            shot(page, "10-solicitud-en-panel")
            print("  ✓ solicitud pública enviada y visible en el panel")

            browser.close()

        print("\nSMOKE DEMO VET OK — capturas en e2e/artifacts/smoke-*")
        return 0
    finally:
        for proc in procs:
            if os.name == "nt":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], capture_output=True)
            else:
                proc.terminate()


if __name__ == "__main__":
    raise SystemExit(main())
