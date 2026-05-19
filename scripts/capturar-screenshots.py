#!/usr/bin/env python3
"""Captura prints do catálogo para docs/screenshots/. Requer: pip install playwright && playwright install chromium"""
from __future__ import annotations

import http.server
import socket
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "screenshots"
PORT = 8765
BASE = f"http://127.0.0.1:{PORT}/index.html"


def free_port(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            return True
        except OSError:
            return False


def start_server(port: int) -> http.server.HTTPServer:
    handler = http.server.SimpleHTTPRequestHandler
    httpd = http.server.HTTPServer(("127.0.0.1", port), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd


def main() -> None:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("Instale: pip install playwright && playwright install chromium")

    OUT.mkdir(parents=True, exist_ok=True)
    use_existing = not free_port(PORT)
    httpd = None
    if not use_existing:
        import os

        os.chdir(ROOT)
        httpd = start_server(PORT)
        time.sleep(0.4)

    shots = [
        ("01-hero-estante.png", None, None),
        ("02-modo-capas.png", 'button[data-modo="grade"]', None),
        ("03-busca-machado.png", "#filtro", "Machado"),
        ("04-filtro-genero-romance.png", None, None),  # chip via JS
        ("05-sem-resultados.png", "#filtro", "zzzqwerty"),
        ("06-modal-ficha.png", None, None),  # abre modal via JS
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(BASE, wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(1500)

        def snap(name: str) -> None:
            path = OUT / name
            page.screenshot(path=str(path), full_page=True)
            print("OK", path.name)

        def click_sel(sel: str) -> None:
            page.locator(sel).first.scroll_into_view_if_needed()
            page.locator(sel).first.click(force=True)

        snap("01-hero-estante.png")

        click_sel('button[data-modo="grade"]')
        page.wait_for_timeout(600)
        snap("02-modo-capas.png")

        click_sel('button[data-modo="estante"]')
        page.wait_for_timeout(400)
        page.fill("#filtro", "Machado")
        page.wait_for_timeout(500)
        snap("03-busca-machado.png")

        page.evaluate(
            """() => {
              const chips = document.querySelectorAll('.filtros__chip');
              for (const c of chips) {
                if (c.textContent && c.textContent.toLowerCase().includes('romance')) {
                  c.click();
                  return;
                }
              }
              if (chips[1]) chips[1].click();
            }"""
        )
        page.fill("#filtro", "")
        page.wait_for_timeout(500)
        snap("04-filtro-genero.png")

        page.fill("#filtro", "zzzqwertysemresultado")
        page.wait_for_timeout(400)
        snap("05-sem-resultados.png")

        page.fill("#filtro", "")
        page.evaluate(
            """() => {
              const livro = document.querySelector('.livro');
              if (livro) livro.click();
            }"""
        )
        page.wait_for_timeout(1000)
        snap("06-modal-ficha.png")

        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight * 0.35)")
        page.wait_for_timeout(400)
        snap("07-estante-detalhe.png")

        browser.close()

    if httpd:
        httpd.shutdown()


if __name__ == "__main__":
    main()
