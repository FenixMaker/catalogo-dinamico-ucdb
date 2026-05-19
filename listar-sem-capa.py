import json, re
from pathlib import Path
t = Path("dados-acervo.js").read_text(encoding="utf-8")
p = json.loads(re.search(r"var PRODUTOS_ACERVO = (\[.*\]);", t, re.S).group(1))
sem = [x for x in p if not x.get("imagem")]
print(len(sem), "sem capa externa:")
for x in sem:
    print(f"  {x['id']:3} | {x['categoria'][:20]:20} | {x['nome']}")
