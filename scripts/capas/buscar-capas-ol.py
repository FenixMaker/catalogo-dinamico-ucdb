# -*- coding: utf-8 -*-
"""Busca capas na Open Library — incremental, com validação de título."""

import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DADOS = ROOT / "dados-acervo.js"
OUT = ROOT / "capas-ol-encontradas.json"


def log(msg):
    print(msg.encode("cp1252", errors="replace").decode("cp1252"))


def normalizar(texto):
    if not texto:
        return ""
    t = unicodedata.normalize("NFD", str(texto).lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return " ".join(t.split())


def tokens_significativos(texto):
    stop = {"de", "da", "do", "das", "dos", "e", "o", "a", "em", "um", "uma", "para", "com", "no", "na"}
    return {w for w in normalizar(texto).split() if len(w) > 2 and w not in stop}


def titulo_compativel(esperado, encontrado):
    if not encontrado:
        return False
    te, tf = tokens_significativos(esperado), tokens_significativos(encontrado)
    if not te:
        return True
    if not tf:
        return False
    inter = len(te & tf)
    return inter >= max(1, min(2, len(te) // 2)) or normalizar(esperado) in normalizar(encontrado)


def carregar_produtos():
    text = DADOS.read_text(encoding="utf-8")
    m = re.search(r"var PRODUTOS_ACERVO = (\[.*\]);", text, re.S)
    return json.loads(m.group(1))


def carregar_encontradas():
    if not OUT.exists():
        return {}
    return json.loads(OUT.read_text(encoding="utf-8"))


def buscar_ol(nome, autor):
    sobrenome = autor.split()[-1] if autor else ""
    queries = [
        {"title": nome, "author": sobrenome, "limit": 5, "language": "por"},
        {"title": nome, "limit": 5, "language": "por"},
        {"q": f"{nome} {sobrenome}", "limit": 5},
    ]
    for params in queries:
        url = "https://openlibrary.org/search.json?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={"User-Agent": "CatalogoAcervo/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.loads(r.read().decode("utf-8"))
        except Exception:
            continue
        for doc in data.get("docs") or []:
            cover = doc.get("cover_i")
            ol_title = doc.get("title", "")
            if cover and titulo_compativel(nome, ol_title):
                return (
                    f"https://covers.openlibrary.org/b/id/{cover}-L.jpg",
                    ol_title,
                )
    return None, None


def main():
    produtos = carregar_produtos()
    found = carregar_encontradas()
    pendentes = [
        p
        for p in produtos
        if not p.get("imagem") and str(p["id"]) not in found
    ]
    log(f"Pendentes: {len(pendentes)} / {len(produtos)} (ja em cache: {len(found)})")
    novos = 0
    for p in pendentes:
        url, t = buscar_ol(p["nome"], p["autor"])
        sid = str(p["id"])
        if url:
            found[sid] = {"nome": p["nome"], "url": url, "ol_title": t}
            novos += 1
            OUT.write_text(json.dumps(found, ensure_ascii=False, indent=2), encoding="utf-8")
            log(f"OK {p['id']:3} {p['nome'][:45]:45}")
        else:
            log(f"-- {p['id']:3} {p['nome'][:45]}")
        time.sleep(0.4)
    OUT.write_text(json.dumps(found, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"\nNovas: {novos} | Total cache: {len(found)}/{len(produtos)} em {OUT}")
    log("Execute: python scripts/acervo/gerar-acervo.py")


if __name__ == "__main__":
    main()
