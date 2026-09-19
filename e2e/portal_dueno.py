"""
E2E del portal del dueño (S14): agenda una cita real -> pide el enlace mágico
-> entra al portal -> reagenda -> cancela -> se ve reflejado en la Agenda del
CRM. Prueba de punta a punta el guard `client` (login sin password).

    python e2e/portal_dueno.py

El enlace mágico se saca de `storage/logs/laravel.log` (MAIL_MAILER=log en
dev) en vez de una bandeja real -- gemelo del resto de e2e/, mismo arranque de
servidores. Requisitos: pip install playwright && playwright install chromium
"""

from __future__ import annotations

import glob
import os
import re
import subprocess
import sys
import time
import urllib.parse
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
LOG_FILE = BACKEND / "storage" / "logs" / "laravel.log"

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
    d = date.today() + timedelta(days=days_ahead)
    while d.weekday() == 6:  # domingo
        d += timedelta(days=1)
    return d.isoformat()


def latest_magic_link(timeout: int = 15) -> str:
    """Última "Entrar a mi portal: <url>" del log (MAIL_MAILER=log)."""
    deadline = time.time() + timeout
    pattern = re.compile(r"Entrar a mi portal: (http://\S+)")
    while time.time() < deadline:
        if LOG_FILE.exists():
            matches = pattern.findall(LOG_FILE.read_text(encoding="utf-8", errors="ignore"))
            if matches:
                return matches[-1]
        time.sleep(1)
    sys.exit("No se encontró el enlace mágico en storage/logs/laravel.log")


def main() -> int:
    ARTIFACTS.mkdir(exist_ok=True)
    for stale in ARTIFACTS.glob("portal-*.png"):
        stale.unlink()

    procs: list[subprocess.Popen] = []
    php_bin = php()

    print("· migrate:fresh --seed (+ cache:clear para resetear rate limits)")
    subprocess.run([php_bin, "artisan", "migrate:fresh", "--seed", "--no-interaction"], cwd=BACKEND, check=True)
    subprocess.run([php_bin, "artisan", "cache:clear"], cwd=BACKEND, check=True)
    LOG_FILE.write_text("", encoding="utf-8")  # log limpio: "última coincidencia" no ambigua

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

        first_date = next_business_day(3)
        second_date = next_business_day(8)
        pet_name = f"FirulaisPortalE2E{uuid.uuid4().hex[:6]}"
        email = f"e2e-portal-{uuid.uuid4().hex[:8]}@ejemplo.co"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            page.on("dialog", lambda d: d.accept())
            page.on("response", lambda r: (
                print(f"  [{r.status}] {r.request.method} {r.url}")
                if "/api/" in r.url and (r.status >= 400 or r.request.method != "GET")
                else None
            ))
            page.on("console", lambda m: print(f"  [console:{m.type}] {m.text}") if m.type in ("error", "warning") else None)

            # ---- 1. Agendar una cita real (dueño nuevo) ----
            print(f"· agendando cita — {first_date}, mascota {pet_name}, dueño {email}")
            page.goto(f"{FRONT_URL}/agendar-cita")
            page.wait_for_load_state("networkidle")
            page.get_by_label("Servicio *").select_option(label="Consulta general")
            page.get_by_label("Fecha *").fill(first_date)
            page.wait_for_load_state("networkidle")
            page.locator("button", has_text=re.compile(r"^\d{2}:\d{2}$")).first.click()
            page.get_by_label("Especie *").select_option(label="Perro")
            page.get_by_label("Nombre de tu mascota *").fill(pet_name)
            page.get_by_label("Tu nombre *").fill("Dueño E2E")
            page.get_by_label("Correo *").fill(email)
            page.get_by_role("checkbox").check()
            page.get_by_role("button", name="Confirmar cita").click()
            expect(page.get_by_text("Tu cita quedó confirmada")).to_be_visible(timeout=15000)
            print("  ✓ cita agendada")

            # ---- 2. Pedir el enlace mágico del portal ----
            print("· pidiendo enlace mágico del portal")
            page.goto(f"{FRONT_URL}/portal/entrar")
            page.wait_for_load_state("networkidle")
            page.get_by_label("Correo *").fill(email)
            page.get_by_role("button", name="Enviarme el enlace").click()
            expect(page.get_by_text("te enviamos un enlace de acceso")).to_be_visible(timeout=15000)

            magic_link = latest_magic_link()
            print(f"  ✓ enlace capturado del log: {magic_link.split('?')[0]}...")

            # ---- 3. Entrar al portal con el enlace ----
            portal_url = f"{FRONT_URL}/portal/entrar?url={urllib.parse.quote(magic_link, safe='')}"
            page.goto(portal_url)
            page.wait_for_url("**/portal", timeout=15000)
            page.wait_for_load_state("networkidle")
            expect(page.get_by_text(pet_name)).to_be_visible(timeout=15000)
            expect(page.get_by_text("Confirmada")).to_be_visible()
            page.screenshot(path=ARTIFACTS / "portal-01-citas.png", full_page=True)
            print("  ✓ logueado en el portal, cita visible")

            # ---- 4. Reagendar ----
            print(f"· reagendando a {second_date}")
            page.get_by_role("button", name="Reagendar").click()
            page.get_by_label("Nueva fecha").fill(second_date)
            page.wait_for_load_state("networkidle")
            new_slot_btn = page.locator("button", has_text=re.compile(r"^\d{2}:\d{2}$")).first
            expect(new_slot_btn).to_be_visible(timeout=15000)
            new_slot_btn.click()
            page.wait_for_load_state("networkidle")
            expect(page.get_by_text(pet_name)).to_be_visible(timeout=15000)
            page.screenshot(path=ARTIFACTS / "portal-02-reagendada.png", full_page=True)
            print("  ✓ cita reagendada")

            # ---- 5. Cancelar ----
            print("· cancelando la cita")
            page.get_by_role("button", name="Cancelar cita").click()
            page.wait_for_load_state("networkidle")
            expect(page.get_by_text("Cancelada")).to_be_visible(timeout=15000)
            # Sin botones de gestión sobre una cita ya cancelada.
            expect(page.get_by_role("button", name="Cancelar cita")).to_have_count(0)
            page.screenshot(path=ARTIFACTS / "portal-03-cancelada.png", full_page=True)
            print("  ✓ cita cancelada")

            # ---- 6. Verificar en la Agenda del CRM ----
            print("· verificación en la Agenda del CRM")
            page.goto(f"{FRONT_URL}/login")
            page.wait_for_load_state("networkidle")
            page.get_by_placeholder("Email").fill("medico@esteticaelite.co")
            page.get_by_placeholder("Contraseña").fill("password")
            page.get_by_role("button", name="Entrar al panel").click()
            try:
                page.wait_for_url("**/app/**", timeout=20000)
            except Exception:
                page.screenshot(path=ARTIFACTS / "portal-98-fallo-login.png", full_page=True)
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
                page.locator('input[type="date"]').fill(second_date)
                page.wait_for_load_state("networkidle")

                patient_link = page.get_by_role("link", name=pet_name)
                expect(patient_link).to_be_visible(timeout=15000)
                card = patient_link.locator("xpath=ancestor::div[contains(@class, 'p-4')][1]")
                expect(card.get_by_text("Cancelada")).to_be_visible()
                page.screenshot(path=ARTIFACTS / "portal-04-crm-agenda.png", full_page=True)
                print("  ✓ cancelación visible en /app/agenda del CRM")
            except AssertionError:
                page.screenshot(path=ARTIFACTS / "portal-97-fallo-crm.png", full_page=True)
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
