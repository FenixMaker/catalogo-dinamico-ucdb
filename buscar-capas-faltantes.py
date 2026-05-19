# -*- coding: utf-8 -*-
"""Segunda busca OL para obras ainda sem capa no cache."""

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
DADOS = ROOT / "dados-acervo.js"
OUT = ROOT / "capas-ol-encontradas.json"


def normalizar(texto):
    import unicodedata

    if not texto:
        return ""
    t = unicodedata.normalize("NFD", str(texto).lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return " ".join(t.split())


def titulo_compativel(esperado, encontrado):
    stop = {"de", "da", "do", "das", "dos", "e", "o", "a", "em", "um", "uma", "para", "com", "no", "na"}
    te = {w for w in normalizar(esperado).split() if len(w) > 2 and w not in stop}
    tf = {w for w in normalizar(encontrado).split() if len(w) > 2 and w not in stop}
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


def buscar(nome, autor):
    for q in [
        {"title": nome, "author": autor, "limit": 8},
        {"q": nome + " " + autor, "limit": 8},
        {"title": nome, "limit": 8},
    ]:
        url = "https://openlibrary.org/search.json?" + urllib.parse.urlencode(q)
        req = urllib.request.Request(url, headers={"User-Agent": "CatalogoAcervo/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.loads(r.read().decode("utf-8"))
        except Exception:
            continue
        for doc in data.get("docs") or []:
            if doc.get("cover_i") and titulo_compativel(nome, doc.get("title", "")):
                return f"https://covers.openlibrary.org/b/id/{doc['cover_i']}-L.jpg", doc.get("title", "")
    return None, None


def main():
    found = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    produtos = carregar_produtos()
    pendentes = [p for p in produtos if str(p["id"]) not in found and not p.get("imagem")]
    print(f"Segunda passagem: {len(pendentes)} obras")
    for p in pendentes:
        sid = str(p["id"])
        url, t = buscar(p["nome"], p["autor"])
        if url:
            found[sid] = {"nome": p["nome"], "url": url, "ol_title": t or p["nome"]}
            print(f"OK {sid} {p['nome']}")
        else:
            print(f"-- {sid} {p['nome']}")
        time.sleep(0.4)
    OUT.write_text(json.dumps(found, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Total cache: {len(found)}/{len(produtos)}")


if __name__ == "__main__":
    main()
