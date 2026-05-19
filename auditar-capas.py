# -*- coding: utf-8 -*-
"""Audita capas do acervo: duplicatas, URLs e cobertura."""

import json
import re
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).parent
DADOS = ROOT / "dados-acervo.js"

OL = "https://covers.openlibrary.org/b/isbn/"


def carregar_produtos():
    text = DADOS.read_text(encoding="utf-8")
    m = re.search(r"var PRODUTOS_ACERVO = (\[.*\]);", text, re.S)
    return json.loads(m.group(1))


def montar_fila_capas(item):
    urls = []
    visto = set()

    def add(url):
        if url and url not in visto:
            visto.add(url)
            urls.append(url)

    add(item.get("imagem"))
    isbn_cat = item.get("isbnCatalogo")
    if isbn_cat:
        add(OL + isbn_cat + "-L.jpg")
        add(OL + isbn_cat + "-M.jpg")
    urls.append("svg-placeholder")  # sempre existe
    urls.append("fallback.svg")
    return urls


def capa_primaria(item):
    fila = montar_fila_capas(item)
    return fila[0] if fila else None


def verificar_url(url, timeout=12):
    if url in ("svg-placeholder", "fallback.svg"):
        return "placeholder"
    req = urllib.request.Request(url, headers={"User-Agent": "CatalogoAcervo/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            ct = r.headers.get("Content-Type", "")
            size = int(r.headers.get("Content-Length", 0) or 0)
            if "image" not in ct and "octet" not in ct:
                return f"bad-type:{ct}"
            if size and size < 500:
                return "tiny"
            return "ok"
    except Exception as e:
        return f"err:{e.__class__.__name__}"


def main():
    produtos = carregar_produtos()
    por_url = defaultdict(list)
    por_isbn_cat = defaultdict(list)
    sem_imagem = []
    placeholder_only = []

    for p in produtos:
        prim = capa_primaria(p)
        por_url[prim].append(p)
        if p.get("isbnCatalogo"):
            por_isbn_cat[p["isbnCatalogo"]].append(p)
        if not p.get("imagem"):
            sem_imagem.append(p)
        if prim in ("svg-placeholder",) or (
            prim and prim.startswith("https") is False
        ):
            pass
        fila = montar_fila_capas(p)
        if not p.get("imagem") and not p.get("isbnCatalogo"):
            placeholder_only.append(p)

    dup_urls = {u: books for u, books in por_url.items() if len(books) > 1 and u not in ("svg-placeholder",)}
    dup_isbn = {k: v for k, v in por_isbn_cat.items() if len(v) > 1}

    print(f"=== AUDITORIA DE CAPAS ({len(produtos)} obras) ===\n")
    print(f"Sem campo 'imagem' no JSON: {len(sem_imagem)}")
    print(f"URLs primárias duplicadas (mesma capa, títulos diferentes): {len(dup_urls)} grupos\n")

    for url, books in sorted(dup_urls.items(), key=lambda x: -len(x[1])):
        print(f"  [{len(books)} obras] {url[:90]}...")
        for b in books[:8]:
            print(f"    - id {b['id']:3} | {b['nome'][:50]}")
        if len(books) > 8:
            print(f"    ... +{len(books)-8} obras")
        print()

    print(f"ISBN catálogo compartilhado (risco OL repetida): {len(dup_isbn)} grupos\n")
    for isbn, books in sorted(dup_isbn.items(), key=lambda x: -len(x[1]))[:15]:
        print(f"  ISBN {isbn} -> {len(books)} obras (ex.: {books[0]['nome']}, {books[1]['nome'] if len(books)>1 else ''})")

    # Verificar URLs Wikimedia únicas
    urls_unicas = {u for u in por_url if u and u.startswith("http")}
    print(f"\n=== Verificação HTTP ({len(urls_unicas)} URLs distintas) ===")
    falhas = []
    for url in sorted(urls_unicas):
        st = verificar_url(url)
        mark = "OK" if st == "ok" else st
        if st != "ok":
            falhas.append((url, st))
        print(f"  {mark:12} {url[:85]}")

    if falhas:
        print(f"\nFalhas HTTP: {len(falhas)}")
    else:
        print("\nTodas as URLs Wikimedia/imagem respondem OK.")

    out = ROOT / "auditoria-final.txt"
    with out.open("w", encoding="utf-8") as f:
        f.write(f"Obras: {len(produtos)}\n")
        f.write(f"Com imagem: {len(produtos) - len(sem_imagem)}\n")
        f.write(f"Sem imagem: {len(sem_imagem)}\n")
        f.write(f"URLs duplicadas: {len(dup_urls)}\n")
    print(f"\nRelatório: {out}")

    # Amostra Open Library para isbnCatalogo únicos
    print("\n=== Amostra Open Library (isbnCatalogo) ===")
    amostra = list({p["isbnCatalogo"]: p["nome"] for p in produtos if p.get("isbnCatalogo")}.items())[:25]
    ol_ok = ol_fail = 0
    for isbn, nome in amostra:
        url = OL + isbn + "-L.jpg"
        st = verificar_url(url)
        if st == "ok":
            ol_ok += 1
        else:
            ol_fail += 1
            print(f"  {st:12} {isbn} ({nome[:40]})")
    print(f"  OL amostra: {ol_ok} ok, {ol_fail} falha (de {len(amostra)} testados)")


if __name__ == "__main__":
    main()
