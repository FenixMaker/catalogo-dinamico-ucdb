# -*- coding: utf-8 -*-
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
data = json.loads((ROOT / "capas-ol-encontradas.json").read_text(encoding="utf-8"))
por_url = defaultdict(list)
for pid, info in data.items():
    por_url[info["url"]].append((pid, info["nome"]))

print("URLs OL duplicadas entre titulos diferentes:")
for url, items in sorted(por_url.items(), key=lambda x: -len(x[1])):
    if len(items) > 1:
        nomes = {n for _, n in items}
        if len(nomes) > 1:
            print(f"  {len(items)}x {url}")
            for pid, nome in items:
                print(f"    {pid} {nome}")
