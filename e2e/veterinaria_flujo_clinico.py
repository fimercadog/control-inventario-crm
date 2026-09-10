"""
E2E del flujo clínico veterinario, extremo a extremo, en navegador real.

    solicitud web  ->  Lead(source=appointment)  ->  recepción
      ->  propietario (Client)  ->  paciente  ->  cita  ->  confirmación
      ->  cita atendida  ->  consulta SOAP  ->  vacuna con producto (descuento de stock)
      ->  receta + PDF  ->  dashboard (fila "Clínica")  ->  reportes clínicos

Levanta backend (:8001) y frontend (:3000) si no están corriendo, corre el
flujo con Playwright (chromium headless) y deja capturas en e2e/artifacts/vet-*.

    python e2e/veterinaria_flujo_clinico.py

Requisitos: pip install playwright && playwright install chromium
Gemelo de catalogo_publico.py — mismo patrón de arranque de servidores.
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
SOON = time.strftime("%Y-%m-%d", time.localtime(time.time() + 3 * 24 * 3600))


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


def shot(page: Page, name: str) -> None:
    page.screenshot(path=ARTIFACTS / f"vet-{name}.png", full_page=True)


def dismiss_beta(page: Page) -> None:
    page.wait_for_load_state("networkidle")
    btn = page.get_by_role("button", name="Entendido")
    try:
        btn.wait_for(state="visible", timeout=4000)
        btn.click()
        btn.wait_for(state="hidden", timeout=5000)
    except Exception:
        pass


def crud_create(page: Page, url: str, action_label: str, fill: dict[str, str], selects: dict[str, str]) -> None:
    """Abre el modal de alta de un ModuleTablePage, completa y guarda."""
    page.goto(f"{FRONT_URL}{url}")
    dismiss_beta(page)
    page.get_by_role("button", name=action_label).first.click()
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible(timeout=10000)
    for label, value in selects.items():
        dialog.get_by_label(label).select_option(label=value)
    for label, value in fill.items():
        dialog.get_by_label(label).fill(value)
    dialog.get_by_role("button", name="Crear registro").click()
    expect(dialog).to_be_hidden(timeout=15000)


def main() -> int:  # noqa: C901 - un flujo lineal, se lee de arriba a abajo
    ARTIFACTS.mkdir(exist_ok=True)
    for stale in ARTIFACTS.glob("vet-*.png"):
        stale.unlink()

    procs: list[subprocess.Popen] = []
    php_bin = php()

    print("· migrate:fresh --seed (+ cache:clear para resetear rate limits)")
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

        tag = uuid.uuid4().hex[:8]
        owner = f"Propietario E2E {tag}"
        email = f"e2e-vet-{tag}@ejemplo.co"
        pet = f"Firulais {tag}"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            # Navegador en hora de Colombia: valida que la agenda no corra las
            # citas por diferencia de zona con el server.
            context = browser.new_context(
                viewport={"width": 1280, "height": 950}, timezone_id="America/Bogota", locale="es-CO"
            )
            page = context.new_page()
            page.on("response", lambda r: (
                print(f"  [{r.status}] {r.request.method} {r.url}")
                if "/api/" in r.url and (r.status >= 400 or r.request.method != "GET")
                else None
            ))
            page.on("console", lambda m: print(f"  [console:{m.type}] {m.text}") if m.type == "error" else None)

            # 1 -- solicitud web pública -> Lead(source=appointment) -------------
            print("· 1. solicitud web /solicitar-cita")
            page.goto(f"{FRONT_URL}/solicitar-cita")
            page.wait_for_load_state("networkidle")
            page.get_by_label("Tu nombre").fill(owner)
            page.get_by_label("Correo").fill(email)
            page.get_by_label("Teléfono").fill("3009876543")
            page.get_by_label("Nombre de la mascota").fill(pet)
            page.get_by_label("Motivo").fill("Vacunación anual")
            page.get_by_role("checkbox").check()
            shot(page, "01-solicitar-cita")
            page.get_by_role("button", name="Solicitar cita").click()
            expect(page.get_by_text("Recibimos tu solicitud")).to_be_visible(timeout=15000)
            print("  ✓ solicitud enviada")

            # 2 -- recepción entra y ve el lead --------------------------------
            print("· 2. login recepción + lead en /app/leads")
            page.goto(f"{FRONT_URL}/login")
            page.wait_for_load_state("networkidle")
            page.get_by_placeholder("Email").fill("admin@vetlosandes.co")
            page.get_by_placeholder("Contraseña").fill("password")
            page.get_by_role("button", name="Entrar al panel").click()
            page.wait_for_url("**/app/**", timeout=20000)
            dismiss_beta(page)

            page.goto(f"{FRONT_URL}/app/leads")
            dismiss_beta(page)
            lead_row = page.get_by_role("row").filter(has_text=email)
            expect(lead_row).to_be_visible(timeout=15000)
            expect(lead_row.get_by_text("Solicitud de cita")).to_be_visible()
            shot(page, "02-lead")
            print("  ✓ lead con origen 'Solicitud de cita'")

            # 3 -- propietario (Client, núcleo reutilizado) --------------------
            print("· 3. alta del propietario")
            crud_create(
                page, "/app/clientes", "Nuevo propietario",
                fill={"Nombre": owner, "Correo": email, "Telefono": "3009876543"},
                selects={"Estado": "Activo"},
            )
            page.goto(f"{FRONT_URL}/app/clientes")
            dismiss_beta(page)
            expect(page.get_by_text(email)).to_be_visible(timeout=15000)
            print("  ✓ propietario creado")

            # 4 -- paciente (mascota) -----------------------------------------
            print("· 4. alta del paciente")
            crud_create(
                page, "/app/pacientes", "Nuevo paciente",
                fill={"Nombre": pet},
                selects={"Propietario": owner, "Especie": "Perro", "Sexo": "Macho", "Estado": "Activo"},
            )
            page.goto(f"{FRONT_URL}/app/pacientes")
            dismiss_beta(page)
            expect(page.get_by_role("row").filter(has_text=pet)).to_be_visible(timeout=15000)
            print("  ✓ paciente creado")

            # 5 -- cita ------------------------------------------------------
            print("· 5. agendar la cita")
            cita_reason = f"Vacunación anual {tag}"
            crud_create(
                page, "/app/citas", "Nueva cita",
                fill={"Inicio": f"{SOON} 09:00", "Fin": f"{SOON} 09:30", "Motivo": cita_reason},
                selects={"Paciente": pet},
            )
            expect(page.get_by_text("Registro creado")).to_be_visible(timeout=10000)
            # buscar por el motivo único aísla la cita nueva (evita paginación)
            page.get_by_placeholder("Buscar...").fill(cita_reason)
            row = lambda: page.get_by_role("row").filter(has_text=pet)
            expect(row()).to_be_visible(timeout=15000)
            expect(row().get_by_text("Programada")).to_be_visible()
            # La hora cargada (09:00) se muestra tal cual, sin corrimiento de zona.
            expect(row()).to_contain_text("9:00")
            shot(page, "05-cita")
            print("  ✓ cita programada, hora 9:00 sin corrimiento")

            # 6 -- confirmación + 7 atendida (acción de fila) ---------------
            print("· 6/7. confirmar y marcar atendida")
            row().get_by_role("button", name="Confirmar").click()
            expect(row().get_by_text("Confirmada")).to_be_visible(timeout=15000)
            row().get_by_role("button", name="Atendida").click()
            expect(row().get_by_text("Atendida")).to_be_visible(timeout=15000)
            shot(page, "07-atendida")
            print("  ✓ cita confirmada y atendida")

            # 8 -- consulta SOAP -------------------------------------------
            print("· 8. consulta SOAP")
            soap_reason = f"Control y vacunación {tag}"
            crud_create(
                page, "/app/consultas", "Nueva consulta",
                fill={
                    "Fecha": TODAY,
                    "Motivo de consulta": soap_reason,
                    "S — Subjetivo": "Dueño reporta buen apetito.",
                    "O — Objetivo": "Mucosas rosadas, T 38.5.",
                    "A — Análisis": "Paciente sano apto para vacuna.",
                    "P — Plan": "Aplicar polivalente. Control en 1 año.",
                },
                selects={"Paciente": pet},
            )
            page.get_by_placeholder("Buscar...").fill(soap_reason)
            expect(page.get_by_role("row").filter(has_text=soap_reason)).to_be_visible(timeout=15000)
            shot(page, "08-consulta")
            print("  ✓ consulta SOAP registrada")

            # 9 -- vacuna con producto -> descuento de stock ---------------
            print("· 9. vacuna con producto (descuenta stock)")
            page.goto(f"{FRONT_URL}/app/vacunas")
            dismiss_beta(page)
            page.get_by_role("button", name="Registrar aplicación").click()
            dialog = page.get_by_role("dialog")
            expect(dialog).to_be_visible(timeout=10000)
            vac_name = f"Vacuna polivalente {tag}"
            dialog.get_by_label("Tipo").select_option("vaccine")
            dialog.get_by_label("Paciente").select_option(label=pet)
            dialog.get_by_label("Nombre / producto aplicado").fill(vac_name)
            dialog.get_by_label("Fecha de aplicación").fill(TODAY)
            dialog.get_by_label("Lote", exact=True).fill(f"LOT-{tag}")
            dialog.get_by_label("Próxima dosis", exact=True).fill(SOON)
            # producto con existencias y la bodega de la farmacia (la que tiene stock)
            prod_sel = dialog.get_by_label("Producto del inventario (descuenta stock)")
            prod_opts = prod_sel.locator("option").all_text_contents()
            prod_idx = next((i for i, t in enumerate(prod_opts) if "antirrábica" in t.lower()), 1)
            prod_sel.select_option(index=prod_idx)
            wh_sel = dialog.get_by_label("Bodega (si aplica producto)")
            wh_opts = wh_sel.locator("option").all_text_contents()
            wh_idx = next((i for i, t in enumerate(wh_opts) if "farmacia" in t.lower()), 1)
            wh_sel.select_option(index=wh_idx)
            dialog.get_by_role("button", name="Crear registro").click()
            expect(dialog).to_be_hidden(timeout=15000)
            page.get_by_placeholder("Buscar...").fill(f"LOT-{tag}")
            vac_row = page.get_by_role("row").filter(has_text=vac_name)
            expect(vac_row).to_be_visible(timeout=15000)
            expect(vac_row.get_by_text("Descontado")).to_be_visible()
            shot(page, "09-vacuna-stock")
            print("  ✓ vacuna aplicada, stock descontado")

            # 10 -- receta + PDF -----------------------------------------
            print("· 10. receta y PDF")
            med_name = f"Amoxicilina flujo {tag}"
            page.goto(f"{FRONT_URL}/app/recetas")
            dismiss_beta(page)
            page.get_by_role("button", name="Nueva receta").click()
            rx = page.get_by_role("dialog")
            expect(rx).to_be_visible(timeout=10000)
            # elegir la consulta de este flujo (por su motivo único); las opciones
            # cargan async, esperar a que aparezca la del flujo
            flow_opt = rx.locator("select option", has_text=soap_reason)
            expect(flow_opt).to_have_count(1, timeout=15000)
            rx.locator("select").select_option(value=flow_opt.get_attribute("value"))
            rx.get_by_placeholder("Medicamento").fill(med_name)
            rx.get_by_placeholder("Dosis").fill("1 comp c/12h")
            rx.get_by_placeholder("Frecuencia").fill("cada 12 horas")
            rx.get_by_placeholder("Duración").fill("7 días")
            rx.get_by_role("button", name="Crear receta").click()
            expect(rx).to_be_hidden(timeout=15000)
            rx_card = page.get_by_role("main").locator("div").filter(has_text=med_name).filter(
                has=page.get_by_role("button", name="Descargar PDF")
            ).last
            expect(rx_card).to_be_visible(timeout=15000)
            with page.expect_download(timeout=20000) as dl:
                rx_card.get_by_role("button", name="Descargar PDF").click()
            out = ARTIFACTS / "vet-10-receta.pdf"
            dl.value.save_as(out)
            assert out.stat().st_size > 800, f"PDF sospechosamente pequeño: {out.stat().st_size} bytes"
            shot(page, "10-recetas")
            print(f"  ✓ receta creada, PDF descargado ({out.stat().st_size} bytes)")

            # 11 -- dashboard: fila "Clínica" --------------------------
            print("· 11. dashboard, fila Clínica")
            page.goto(f"{FRONT_URL}/app/dashboard")
            dismiss_beta(page)
            main = page.get_by_role("main")
            expect(main.get_by_text("Clínica", exact=True).first).to_be_visible(timeout=20000)
            for label in ("Citas hoy", "Pacientes activos", "Vacunas por vencer", "Consultas del mes"):
                expect(main.get_by_text(label, exact=True)).to_be_visible()
            shot(page, "11-dashboard")
            print("  ✓ dashboard muestra la fila Clínica")

            # 12 -- reportes clínicos ---------------------------------
            print("· 12. reportes clínicos")
            page.goto(f"{FRONT_URL}/app/reportes-clinicos")
            dismiss_beta(page)
            expect(page.get_by_role("heading", name="Reportes clínicos")).to_be_visible(timeout=20000)
            expect(page.get_by_text("Pacientes atendidos")).to_be_visible()
            expect(page.get_by_text("Ingreso estimado por servicio")).to_be_visible()
            shot(page, "12-reportes")
            print("  ✓ reportes clínicos renderizan")

            browser.close()

        print("\nE2E VET OK — capturas en e2e/artifacts/vet-*")
        return 0
    finally:
        for proc in procs:
            if os.name == "nt":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], capture_output=True)
            else:
                proc.terminate()


if __name__ == "__main__":
    raise SystemExit(main())
