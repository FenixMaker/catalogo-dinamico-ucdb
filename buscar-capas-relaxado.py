# -*- coding: utf-8 -*-
"""Terceira passagem OL — critério de título mais flexível."""

import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
DADOS = ROOT / "dados-acervo.js"
OUT = ROOT / "capas-ol-encontradas.json"


def normalizar(texto):
    if not texto:
        return ""
    t = unicodedata.normalize("NFD", str(texto).lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return " ".join(t.split())


def titulo_flex(esperado, encontrado, autor, doc_authors):
    te = set(normalizar(esperado).split())
    tf = set(normalizar(encontrado).split())
    if te & tf:
        return True
    if autor and doc_authors:
        sob = normalizar(autor.split()[-1])
        for a in doc_authors:
            if sob in normalizar(a):
                return True
    return False


def carregar():
    text = DADOS.read_text(encoding="utf-8")
    m = re.search(r"var PRODUTOS_ACERVO = (\[.*\]);", text, re.S)
    return json.loads(m.group(1))


def main():
    found = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    produtos = carregar()
    pendentes = [p for p in produtos if str(p["id"]) not in found and not p.get("imagem")]
    print(f"Relaxado: {len(pendentes)} obras")
    novos = 0
    for p in pendentes:
        sid = str(p["id"])
        nome, autor = p["nome"], p["autor"]
        url = None
        for params in [
            {"q": f"{nome} {autor}", "limit": 8},
            {"title": nome, "limit": 8},
            {"author": autor, "limit": 8},
        ]:
            req_url = "https://openlibrary.org/search.json?" + urllib.parse.urlencode(params)
            req = urllib.request.Request(req_url, headers={"User-Agent": "CatalogoAcervo/1.0"})
            try:
                with urllib.request.urlopen(req, timeout=15) as r:
                    data = json.loads(r.read().decode("utf-8"))
            except Exception:
                continue
            for doc in data.get("docs") or []:
                if doc.get("cover_i") and titulo_flex(
                    nome, doc.get("title", ""), autor, doc.get("author_name") or []
                ):
                    url = f"https://covers.openlibrary.org/b/id/{doc['cover_i']}-L.jpg"
                    break
            if url:
                break
        if url:
            found[sid] = {"nome": nome, "url": url, "ol_title": nome}
            novos += 1
            OUT.write_text(json.dumps(found, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"OK {sid} {nome[:50]}")
        else:
            print(f"-- {sid} {nome[:50]}")
        time.sleep(0.35)
    print(f"Novas: {novos} | Total: {len(found)}")


if __name__ == "__main__":
    main()
