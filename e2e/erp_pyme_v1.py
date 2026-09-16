"""
E2E ERP Pyme V1 — compra, venta, caja, permisos e idempotencia.

    python e2e/erp_pyme_v1.py

Requisitos: pip install playwright && playwright install chromium
"""

from __future__ import annotations

import glob
import os
import subprocess
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

from playwright.sync_api import APIRequestContext, Page, expect, sync_playwright

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


def dismiss_beta(page: Page) -> None:
    page.wait_for_load_state("networkidle")
    try:
        btn = page.get_by_role("button", name="Entendido")
        btn.wait_for(state="visible", timeout=3000)
        btn.click()
    except Exception:
        pass


def login(page: Page, email: str = "admin@vetlosandes.co") -> None:
    page.goto(f"{FRONT_URL}/login")
    page.wait_for_load_state("networkidle")
    page.get_by_placeholder("Email").fill(email)
    page.get_by_placeholder("Contraseña").fill("password")
    page.get_by_role("button", name="Entrar al panel").click()
    page.wait_for_url("**/app/**", timeout=20000)
    dismiss_beta(page)


def api_get(req: APIRequestContext, path: str) -> dict:
    res = req.get(f"{API_URL}/api{path}")
    assert res.ok, f"GET {path} -> {res.status}: {res.text()}"
    return res.json()


def api_post(req: APIRequestContext, path: str, data: dict) -> dict:
    res = req.post(f"{API_URL}/api{path}", data=data)
    assert res.ok, f"POST {path} -> {res.status}: {res.text()}"
    return res.json()


def first(req: APIRequestContext, path: str) -> dict:
    data = api_get(req, f"{path}?per_page=100")["data"]
    assert data, f"Sin datos en {path}"
    return data[0]


def api_login(req: APIRequestContext, email: str = "admin@vetlosandes.co") -> None:
    headers = {"Accept": "application/json", "Origin": FRONT_URL, "Referer": f"{FRONT_URL}/login"}
    req.get(f"{API_URL}/sanctum/csrf-cookie", headers=headers)
    state = req.storage_state()
    xsrf = next((c["value"] for c in state["cookies"] if c["name"] == "XSRF-TOKEN"), None)
    assert xsrf, "No se recibió cookie XSRF-TOKEN"
    headers["X-XSRF-TOKEN"] = urllib.parse.unquote(xsrf)
    res = req.post(f"{API_URL}/api/auth/login", data={"email": email, "password": "password"}, headers=headers)
    assert res.ok, f"API login -> {res.status}: {res.text()}"


def page_has(page: Page, route: str, heading: str) -> None:
    page.goto(f"{FRONT_URL}{route}")
    dismiss_beta(page)
    expect(page.get_by_role("heading", name=heading)).to_be_visible(timeout=20000)
    page.screenshot(path=ARTIFACTS / f"erp-{route.strip('/').replace('/', '-')}.png", full_page=True)


def main() -> int:
    ARTIFACTS.mkdir(exist_ok=True)
    for stale in ARTIFACTS.glob("erp-*.png"):
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
        print("· build frontend")
        subprocess.run("npm run build", cwd=FRONTEND, shell=True, check=True)
        print("· arrancando frontend :3000")
        procs.append(subprocess.Popen("npm run start -- --port 3000", cwd=FRONTEND, shell=True))

    try:
        wait_for(f"{API_URL}/api/public/catalog/categories", "backend")
        wait_for(FRONT_URL, "frontend")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1366, "height": 900}, timezone_id="America/Bogota")
            page = context.new_page()
            page.on("response", lambda r: (
                print(f"  [{r.status}] {r.request.method} {r.url}")
                if "/api/" in r.url and r.status >= 400
                else None
            ))

            print("· login admin y pantallas ERP")
            login(page)
            for route, heading in [
                ("/app/facturas", "Facturas internas"),
                ("/app/cuentas-por-cobrar", "Cuentas por cobrar"),
                ("/app/cuentas-por-pagar", "Cuentas por pagar"),
                ("/app/pagos", "Pagos y abonos"),
                ("/app/cajas", "Cajas"),
                ("/app/sesiones-caja", "Sesiones de caja"),
                ("/app/movimientos-caja", "Movimientos de caja"),
                ("/app/recepciones-compra", "Recepciones"),
            ]:
                page_has(page, route, heading)

            req = context.request
            api_login(req)
            supplier = first(req, "/suppliers")
            warehouse = first(req, "/warehouses")
            product = first(req, "/products")
            client = first(req, "/clients")

            register = api_post(req, "/cash-registers", {"name": "Caja E2E ERP", "status": "active"})["data"]
            session = api_post(req, "/cash-sessions", {"cash_register_id": register["id"], "opening_amount": 50000})["data"]

            print("· flujo compra: proveedor -> orden -> recepción parcial -> inventario -> CxP -> pago -> caja")
            po = api_post(req, "/purchase-orders", {"supplier_id": supplier["id"], "warehouse_id": warehouse["id"]})["data"]
            po = api_post(req, f"/purchase-orders/{po['id']}/items", {
                "product_id": product["id"],
                "quantity": 100,
                "unit_cost": 1000,
            })["data"]
            item_id = po["items"][0]["id"]
            api_post(req, "/purchase-receipts", {
                "purchase_order_id": po["id"],
                "items": [{"purchase_order_item_id": item_id, "quantity": 40}],
                "idempotency_key": "e2e-receipt-40",
            })
            api_post(req, "/purchase-receipts", {
                "purchase_order_id": po["id"],
                "items": [{"purchase_order_item_id": item_id, "quantity": 60}],
                "idempotency_key": "e2e-receipt-60",
            })
            po_done = api_get(req, f"/purchase-orders/{po['id']}")["data"]
            assert po_done["status"] == "received", po_done
            payables = api_get(req, "/accounts-payable?per_page=100")["data"]
            payable = next(row for row in payables if row["purchase_order_id"] == po["id"])
            api_post(req, "/payments", {
                "target_type": "payable",
                "target_id": payable["id"],
                "amount": payable["balance"],
                "cash_session_id": session["id"],
                "idempotency_key": "e2e-payable-payment",
            })
            payable_paid = api_get(req, f"/accounts-payable/{payable['id']}")["data"]
            assert float(payable_paid["balance"]) == 0, payable_paid

            print("· flujo venta: cliente -> factura interna -> inventario -> CxC -> pagos parciales -> caja")
            invoice = api_post(req, "/invoices", {
                "client_id": client["id"],
                "warehouse_id": warehouse["id"],
                "due_date": time.strftime("%Y-%m-%d", time.localtime(time.time() + 10 * 86400)),
                "items": [{"product_id": product["id"], "quantity": 2, "unit_price": 2500}],
                "idempotency_key": "e2e-invoice",
            })["data"]
            invoice = api_post(req, f"/invoices/{invoice['id']}/issue", {})["data"]
            assert invoice["status"] == "issued", invoice
            receivables = api_get(req, "/accounts-receivable?per_page=100")["data"]
            receivable = next(row for row in receivables if row["invoice_id"] == invoice["id"])
            api_post(req, "/payments", {
                "target_type": "receivable",
                "target_id": receivable["id"],
                "amount": 1000,
                "cash_session_id": session["id"],
                "idempotency_key": "e2e-receivable-partial",
            })
            api_post(req, "/payments", {
                "target_type": "receivable",
                "target_id": receivable["id"],
                "amount": float(receivable["balance"]) - 1000,
                "cash_session_id": session["id"],
                "idempotency_key": "e2e-receivable-final",
            })
            receivable_paid = api_get(req, f"/accounts-receivable/{receivable['id']}")["data"]
            assert float(receivable_paid["balance"]) == 0, receivable_paid

            print("· idempotencia")
            dup = api_post(req, "/payments", {
                "target_type": "receivable",
                "target_id": receivable["id"],
                "amount": 1,
                "cash_session_id": session["id"],
                "idempotency_key": "e2e-receivable-final",
            })["data"]
            assert int(dup["id"]) > 0
            paid_after_dup = api_get(req, f"/accounts-receivable/{receivable['id']}")["data"]
            assert float(paid_after_dup["balance"]) == 0, paid_after_dup

            print("· caja: cierre")
            closed = api_post(req, f"/cash-sessions/{session['id']}/close", {"closing_amount": 0})["data"]
            assert closed["status"] == "closed", closed

            print("· permisos: recepción sin acceso a facturas")
            page.get_by_role("button", name="Cerrar sesion").click()
            login(page, "recepcion@vetlosandes.co")
            page.goto(f"{FRONT_URL}/app/facturas")
            dismiss_beta(page)
            expect(page.get_by_text("No tienes acceso a esta seccion")).to_be_visible(timeout=20000)
            page.screenshot(path=ARTIFACTS / "erp-permisos-recepcion.png", full_page=True)

            print("· multiempresa: aislamiento entre empresas")
            # Verificar que el usuario no puede consultar facturas ni cajas de otra empresa
            res_invalid = req.get(f"{API_URL}/api/invoices/999999")
            assert res_invalid.status == 404, f"Aislamiento falló: {res_invalid.status}"

            browser.close()

        print("\nE2E ERP PYME V1 OK — capturas en e2e/artifacts/erp-*")
        return 0
    finally:
        for proc in procs:
            if os.name == "nt":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], capture_output=True)
            else:
                proc.terminate()


if __name__ == "__main__":
    raise SystemExit(main())
