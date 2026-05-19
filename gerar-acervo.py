# -*- coding: utf-8 -*-
"""Gera dados-acervo.js a partir de obras-por-genero.json."""

import json
import unicodedata
from pathlib import Path

GENEROS = [
    "Romance",
    "Romance regional",
    "Romance indianista",
    "Modernismo",
    "Naturalismo",
    "Conto longo",
    "Ficção",
]

ISBN_GENERICO = "9788535902777"
ROOT = Path(__file__).parent

# Capas Wikimedia (edição canônica / 1ª edição) — chave = id após ordenação.
CAPAS_WIKI_POR_ID = {
    7: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Grande_Sertao_Veredas_1.jpg/500px-Grande_Sertao_Veredas_1.jpg",
    141: "https://upload.wikimedia.org/wikipedia/commons/0/02/Capa_de_Macuna%C3%ADma_2.jpg",
    201: "https://upload.wikimedia.org/wikipedia/commons/b/bd/O_corti%C3%A7o_1a_edicao.png",
    251: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/O_alienista_by_Machado_de_Assis_1a_edicao.png/500px-O_alienista_by_Machado_de_Assis_1a_edicao.png",
}

# Mesmo título canônico → reutiliza capa de outra entrada.
CAPAS_ALIASES_TITULO = {
    "O Guarani (edição comentada)": "O Guarani",
    "Dom Casmurro (conto: Capítulo CXXV)": "Dom Casmurro",
    "A Hora do Star": "A Hora da Estrela",
    "Ubajara": "Ubirajara",
}


def normalizar_titulo(t):
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


def carregar_obras():
    path = ROOT / "obras-por-genero.json"
    if not path.exists():
        raise SystemExit("Execute construir-obras-json.py para gerar obras-por-genero.json")
    return json.loads(path.read_text(encoding="utf-8"))


def carregar_capas_ol():
    path = ROOT / "capas-ol-encontradas.json"
    if not path.exists():
        return {}
    raw = json.loads(path.read_text(encoding="utf-8"))
    return {int(k): v["url"] for k, v in raw.items()}


def carregar_capas_manuais():
    path = ROOT / "capas-manuais.json"
    if not path.exists():
        return {}
    raw = json.loads(path.read_text(encoding="utf-8"))
    return {int(k): v if isinstance(v, str) else v.get("url", "") for k, v in raw.items()}


def isbns_compartilhados(obras_por_genero):
    from collections import Counter

    c = Counter()
    for genero in GENEROS:
        for item in obras_por_genero[genero]:
            c[item.get("isbn", ISBN_GENERICO)] += 1
    return {isbn for isbn, n in c.items() if n > 1 and isbn != ISBN_GENERICO}


def indice_por_titulo(produtos):
    idx = {}
    for p in produtos:
        idx[normalizar_titulo(p["nome"])] = p["id"]
    return idx


def capa_para_obra(pid, nome, capas_ol, capas_manuais, titulo_idx, produtos_por_id):
    if nome.startswith("Antologia de "):
        return None
    if pid in capas_manuais and capas_manuais[pid]:
        return capas_manuais[pid]
    if pid in CAPAS_WIKI_POR_ID:
        return CAPAS_WIKI_POR_ID[pid]
    alias = CAPAS_ALIASES_TITULO.get(nome)
    if alias:
        aid = titulo_idx.get(normalizar_titulo(alias))
        if aid:
            return (
                capas_manuais.get(aid)
                or CAPAS_WIKI_POR_ID.get(aid)
                or capas_ol.get(aid)
            )
    return capas_ol.get(pid)


def isbn_unico(pid):
    return "97885" + str(pid).zfill(8)


def main():
    obras = carregar_obras()
    capas_ol = carregar_capas_ol()
    capas_manuais = carregar_capas_manuais()
    isbns_shared = isbns_compartilhados(obras)
    produtos = []
    pid = 1
    for genero in GENEROS:
        for item in obras[genero]:
            nome = item["nome"]
            autor = item["autor"]
            ano = item["ano"]
            paginas = item["paginas"]
            preco = item["preco"]
            isbn_ref = item.get("isbn", ISBN_GENERICO)
            desc = item["descricao"]
            isbn_final = isbn_ref if isbn_ref != ISBN_GENERICO else isbn_unico(pid)
            produtos.append(
                {
                    "_pid": pid,
                    "nome": nome,
                    "autor": autor,
                    "categoria": genero,
                    "ano": ano,
                    "paginas": paginas,
                    "preco": preco,
                    "desc": desc,
                    "isbn_ref": isbn_ref,
                    "isbn_final": isbn_final,
                }
            )
            pid += 1

    titulo_idx = indice_por_titulo(
        [{"id": p["_pid"], "nome": p["nome"]} for p in produtos]
    )
    produtos_por_id = {p["_pid"]: p for p in produtos}

    saida = []
    for p in produtos:
        pid = p["_pid"]
        genero = p["categoria"]
        desc = p["desc"]
        imagem = capa_para_obra(
            pid, p["nome"], capas_ol, capas_manuais, titulo_idx, produtos_por_id
        )
        desc_longa = (
            desc
            + " Obra do acervo de "
            + genero.lower()
            + " na literatura brasileira, disponível para consulta de ficha e referência de preço."
        )
        entry = {
            "id": pid,
            "isbn": p["isbn_final"],
            "nome": p["nome"],
            "autor": p["autor"],
            "categoria": genero,
            "preco": p["preco"],
            "ano": p["ano"],
            "paginas": p["paginas"],
            "descricao": desc,
            "descricaoLonga": desc_longa,
        }
        if imagem:
            entry["imagem"] = imagem
        elif p["isbn_ref"] != ISBN_GENERICO and p["isbn_ref"] not in isbns_shared:
            entry["isbnCatalogo"] = p["isbn_ref"]
        saida.append(entry)

    out = ROOT / "dados-acervo.js"
    lines = [
        "/** Acervo gerado — 50 obras por gênero (350 títulos). */",
        "var PRODUTOS_ACERVO = " + json.dumps(saida, ensure_ascii=False, indent=2) + ";",
        "",
    ]
    out.write_text("\n".join(lines), encoding="utf-8")
    com_img = sum(1 for x in saida if x.get("imagem"))
    print(f"Gerados {len(saida)} livros em {out} ({com_img} com imagem)")


if __name__ == "__main__":
    main()
