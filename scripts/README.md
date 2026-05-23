# Scripts utilitários

Ferramentas Python de apoio ao catálogo. Execute a partir da **raiz do projeto**.

## Capturas de tela

```powershell
pip install playwright
python -m playwright install chromium
python scripts/capturar-screenshots.py
```

Salva PNGs em `docs/screenshots/`.

## Pipeline do acervo

```powershell
python scripts/acervo/construir-obras-json.py   # gera obras-por-genero.json
python scripts/acervo/gerar-acervo.py           # gera dados-acervo.js
```

## Capas (Open Library / auditoria)

```powershell
python scripts/capas/buscar-capas-ol.py
python scripts/capas/buscar-capas-faltantes.py
python scripts/capas/auditar-capas.py
python scripts/capas/listar-sem-capa.py
```

Saídas temporárias (`capas-ol-encontradas.json`, logs) estão no `.gitignore`.
