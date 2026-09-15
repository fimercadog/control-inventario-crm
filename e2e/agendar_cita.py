"""
E2E de "Agendar cita" (S13): sitio -> elegir servicio/fecha/horario real ->
confirmar -> la cita aparece confirmada en la Agenda del CRM.

A diferencia de solicitar_cita (que solo genera un Lead), este flujo crea una
cita real (`status=confirmed`) de punta a punta.

    python e2e/agendar_cita.py

Gemelo de catalogo_publico.py / smoke_demo_veterinaria.py -- mismo arranque de
servidores. Requisitos: pip install playwright && playwright install chromium
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
from datetime import date, timedelta
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

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


def next_business_day(days_ahead: int) -> str:
    """Un día hábil (lunes-sábado, ver config/scheduling.php) a >= `days_ahead`
    de hoy, para que la anticipación mínima (60 min) nunca sea el problema."""
    d = date.today() + timedelta(days=days_ahead)
    while d.weekday() == 6:  # domingo
        d += timedelta(days=1)
    return d.isoformat()


def main() -> int:
    ARTIFACTS.mkdir(exist_ok=True)
    for stale in ARTIFACTS.glob("agenda-*.png"):
        stale.unlink()

    procs: list[subprocess.Popen] = []
    php_bin = php()

    print("· migrate:fresh --seed (+ cache:clear para resetear rate limits)")
    subprocess.run([php_bin, "artisan", "migrate:fresh", "--seed", "--no-interaction"], cwd=BACKEND, check=True)
    subprocess.run([php_bin, "artisan", "cache:clear"], cwd=BACKEND, check=True)

    if not up(f"{API_URL}/api/public/appointments/services"):
        print("· arrancando backend :8001")
        procs.append(subprocess.Popen([php_bin, "artisan", "serve", "--port=8001"], cwd=BACKEND))
    if not up(FRONT_URL):
        print("· build de produccion del frontend")
        subprocess.run("npm run build", cwd=FRONTEND, shell=True, check=True)
        print("· arrancando frontend :3000")
        procs.append(subprocess.Popen("npm run start -- --port 3000", cwd=FRONTEND, shell=True))

    try:
        wait_for(f"{API_URL}/api/public/appointments/services", "backend")
        wait_for(FRONT_URL, "frontend")

        booking_date = next_business_day(3)
        pet_name = f"FirulaisE2E{uuid.uuid4().hex[:6]}"
        email = f"e2e-cita-{uuid.uuid4().hex[:8]}@ejemplo.co"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            page.on("request", lambda r: print(f"  -> {r.method} {r.url}") if "/api/" in r.url and r.method != "GET" else None)
            page.on("response", lambda r: (
                print(f"  [{r.status}] {r.request.method} {r.url}")
                if "/api/" in r.url and (r.status >= 400 or r.request.method != "GET")
                else None
            ))
            page.on("console", lambda m: print(f"  [console:{m.type}] {m.text}") if m.type in ("error", "warning") else None)

            # ---- Flujo 1: visitante agenda una cita real ----
            print(f"· flujo público — fecha {booking_date}, mascota {pet_name}")
            page.goto(f"{FRONT_URL}/agendar-cita")
            page.wait_for_load_state("networkidle")

            page.get_by_label("Servicio *").select_option(label="Consulta general")
            page.get_by_label("Fecha *").fill(booking_date)
            page.wait_for_load_state("networkidle")

            slot_button = page.locator("button", has_text=re.compile(r"^\d{2}:\d{2}$")).first
            expect(slot_button).to_be_visible(timeout=15000)
            chosen_slot = slot_button.inner_text().strip()
            page.screenshot(path=ARTIFACTS / "agenda-01-horarios.png", full_page=True)
            slot_button.click()

            page.get_by_label("Especie *").select_option(label="Perro")
            page.get_by_label("Nombre de tu mascota *").fill(pet_name)
            page.get_by_label("Tu nombre *").fill("Ana E2E")
            page.get_by_label("Correo *").fill(email)
            page.get_by_label("Teléfono").fill("3001234567")
            page.get_by_role("checkbox").check()
            page.screenshot(path=ARTIFACTS / "agenda-02-formulario.png", full_page=True)
            page.get_by_role("button", name="Confirmar cita").click()

            try:
                expect(page.get_by_text("Tu cita quedó confirmada")).to_be_visible(timeout=15000)
            except AssertionError:
                page.screenshot(path=ARTIFACTS / "agenda-99-fallo-booking.png", full_page=True)
                raise
            page.screenshot(path=ARTIFACTS / "agenda-03-exito.png", full_page=True)
            print(f"  ✓ cita agendada — horario {chosen_slot}")

            # ---- Flujo 2: la clínica la ve confirmada en la Agenda ----
            print("· verificación en la Agenda del CRM")
            page.goto(f"{FRONT_URL}/login")
            page.wait_for_load_state("networkidle")
            page.get_by_placeholder("Email").fill("veterinario@vetlosandes.co")
            page.get_by_placeholder("Contraseña").fill("password")
            page.get_by_role("button", name="Entrar al panel").click()
            try:
                page.wait_for_url("**/app/**", timeout=20000)
            except Exception:
                page.screenshot(path=ARTIFACTS / "agenda-98-fallo-login.png", full_page=True)
                print(f"  url actual: {page.url}")
                raise

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
                page.goto(f"{FRONT_URL}/app/agenda")
                dismiss_beta()
                page.locator('input[type="date"]').fill(booking_date)
                page.wait_for_load_state("networkidle")

                patient_link = page.get_by_role("link", name=pet_name)
                expect(patient_link).to_be_visible(timeout=15000)
                # El link vive en el mismo bloque .p-4 que el badge de estado y el
                # detalle del servicio; subir al ancestro más cercano con esa clase
                # evita matchear otras citas del día que también sean "Consulta general".
                card = patient_link.locator("xpath=ancestor::div[contains(@class, 'p-4')][1]")
                expect(card.get_by_text("Confirmada")).to_be_visible()
                expect(card.get_by_text("Consulta general")).to_be_visible()
                page.screenshot(path=ARTIFACTS / "agenda-04-crm-agenda.png", full_page=True)
                print("  ✓ cita confirmada visible en /app/agenda")
            except AssertionError:
                page.screenshot(path=ARTIFACTS / "agenda-97-fallo-crm.png", full_page=True)
                print(f"  url actual: {page.url}")
                raise

            browser.close()
        print("\nE2E OK — capturas en e2e/artifacts/")
        return 0
    finally:
        for proc in procs:
            if os.name == "nt":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], capture_output=True)
            else:
                proc.terminate()


if __name__ == "__main__":
    raise SystemExit(main())
