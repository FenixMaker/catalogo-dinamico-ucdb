# Catálogo dinâmico — Entender do zero + onde mostrar + o que falar

Use este arquivo como **roteiro de ensaio**. Leia a seção “Entenda em 2 minutos” antes da apresentação; na hora, siga a seção **§5 — Apresentação passo a passo** com a tela aberta.

---

## 0. Antes de ligar o projetor (checklist)

| Verificação | Onde |
|-------------|------|
| Pasta do trabalho aberta no Explorador | `catalogo-dinamico` |
| Arquivos que você pode abrir se perguntarem | `index.html`, `app.js`, `dados-acervo.js`, `styles.css`, pasta `capas/` |
| Página no navegador | Preferência: `http://127.0.0.1:8765/index.html` (veja §3). Se não tiver servidor, abra `index.html` direto. |
| Navegador em tela cheia ou só a aba do catálogo | Para não aparecer e-mail / abas pessoais. |

---

## 1. Entenda em 2 minutos (o que esse projeto **é**)

Imagine uma **planilha de livros** no JavaScript (array `PRODUTOS_ACERVO` em `dados-acervo.js`). O site **não recarrega** quando você digita: o script **lê** o que você digitou, **filtra** a planilha na memória e **redesenha** a estante ou a grade de capas na página.

- **DOM** = a árvore de elementos que o navegador montou a partir do HTML (`<section>`, `<article>`, etc.). Você **muda** essa árvore com JavaScript.
- **Evento** = “algo aconteceu” (usuário digitou, clicou, apertou tecla). O script **escuta** com `addEventListener`.
- **filter / map / forEach** = formas de percorrer o array: filtrar itens, transformar dados, e para cada item **criar** um pedaço de interface.

**Uma frase para abrir a boca:**  
“É o catálogo da **Livraria Almanaque**: JavaScript **reage ao input**, filtra o array em memória e **recria os nós do DOM** a cada tecla, sem `location.reload`.”

---

## 2. Cada arquivo e cada parte da tela — o que é

### `index.html` — estrutura (esqueleto)

| O que tem | Para que serve |
|-----------|----------------|
| `<header>`, `<main>`, `<section>` | Organizam a página (hero, filtros, catálogo, modal). |
| `id="filtro"` | Campo **Consultar o catálogo da livraria**. O JS usa **`getElementById("filtro")`** para o listener de teclado. |
| `#filtros-categorias` | Chips de gênero literário (Romance, Modernismo…). |
| `#lista-produtos` | Contêiner vazio no HTML; o script monta estante ou grade aqui. |
| Botões **Estante / Capas** | Alternam o modo de visualização (`data-modo`). |
| Modal da ficha | Abre ao clicar em um livro (capa, sinopse, preço). |

### `dados-acervo.js` — dados

| O que tem | Para que serve |
|-----------|----------------|
| `var PRODUTOS_ACERVO = [ ... ]` | **350 obras** da literatura brasileira (título, autor, ISBN, capa…). |
| Gerado por script | `python scripts/acervo/gerar-acervo.py` (a partir de `obras-por-genero.json`). |

### `styles.css` — aparência (visual)

| Você pode ver… | Significado |
|----------------|-------------|
| `:root { --bg: ...; --primary: ... }` | **Variáveis CSS**: paleta editorial (pergaminho, ouro, fundo escuro). |
| `.estante`, `.grade-capas` | Dois layouts do catálogo (lombadas 3D vs. grade de capas). |
| `.modal` | Ficha da obra em overlay. |
| `@media (prefers-reduced-motion: reduce)` | Respeita quem pediu **menos animação** no sistema. |

### `app.js` — comportamento (núcleo pedido na disciplina)

| Trecho | O que faz |
|--------|-----------|
| `PRODUTOS_ACERVO` (importado) | Fonte dos dados **em memória**. |
| `obterFiltrados()` | Usa **`.filter`** no array; combina busca textual + gênero. |
| `renderizar()` | Limpa o contêiner e remonta estante ou grade conforme o modo. |
| `montarCartao` / lombadas | **`document.createElement`**, capa (Open Library + fallback), **`appendChild`**. |
| `addEventListener("input", …)` | **Evento**: cada mudança no campo chama nova renderização. |
| Modal | Abre/fecha ficha da obra; tecla **Esc** fecha. |

### O que você vê no **navegador**

| Na tela | O que é (ligação técnica) |
|---------|---------------------------|
| Hero com estatísticas | HTML estático + dados calculados do acervo. |
| Chips de gênero | Filtro por categoria; combina com a busca. |
| Estante ou Capas | Dois modos de exibição; escolha salva em `sessionStorage`. |
| Campo de busca e **Limpar filtros** | Filtro em tempo real; botão zera busca e gênero. |
| Modal ao clicar no livro | Ficha completa criada/atualizada pelo JS. |

---

## 3. Onde abrir na tela (para não dar erro na hora)

### Opção recomendada — servidor local

1. Abra a pasta `catalogo-dinamico`.
2. Duplo clique em **`servidor-local.bat`** (ou `iniciar-catalogo.bat`).
3. No navegador: **`http://127.0.0.1:8765/index.html`**

**Por quê:** com `http://` as fontes (Google Fonts) e as **capas** (Open Library / Wikimedia) carregam melhor que em `file://`.

### Capas reais (Open Library / Wikimedia)

- Cada livro tem URL de capa externa e **`isbn`** para fallback na Open Library.
- Se a capa falhar, o script usa **`capas/fallback.svg`**.

### Se o CSS/JS parecer “antigo”

Feche abas antigas, use **Ctrl+F5** ou aumente o sufixo **`?v=`** nos links de `styles.css` e `app.js` no `index.html`.

---

## 4. O que o trabalho pede ↔ onde está no projeto

| O professor quer ver | Onde você **mostra** | Onde está no **código** |
|----------------------|----------------------|-------------------------|
| Filtro em tempo real, sem F5 | Campo **Consultar o catálogo da livraria** | `app.js` — listener `input` em `#filtro` |
| `filter`, `map`, `forEach` | Abra `app.js` e role até as funções | `obterFiltrados` → `filter`; `renderizar` → `map` + `forEach` |
| `createElement` / `appendChild` | F12 → Elements → `<article>` ou lombadas | Funções de montagem no `app.js` |
| Estado vazio | Digite `zzz` ou termo inexistente | Classes de “sem resultados” + mensagem |
| Limpar / fluxo | **Limpar filtros** ou **Escape** | Rotina que zera termo e re-renderiza |

Arquivos: **`index.html`**, **`styles.css`**, **`app.js`** (lógica), **`dados-acervo.js`** (dados).

---

## 5. Apresentação passo a passo (copie o roteiro na hora)

**Tempo total sugerido:** 4 a 6 minutos.

---

### Momento A — Abrir e contextualizar (30 s)

**Onde mostrar:** navegador com o catálogo na tela cheia.

**O que falar:**  
“Este é o catálogo da **Livraria Almanaque**, em HTML/CSS/JavaScript puro. Os dados estão em **`dados-acervo.js`**. O usuário **filtra em tempo real** por texto e gênero, alterna entre **estante** e **capas**, e abre a **ficha** de cada obra — tudo **sem recarregar** a página.”

---

### Momento B — Modos e filtro (60 s)

**Onde mostrar:** catálogo — botões Estante/Capas e campo de busca.

**O que fazer:**

1. Mostre o modo **Estante** (lombadas por gênero).
2. Clique em **Capas** e mostre a grade.
3. Volte à estante; digite **`Machado`** no campo de busca.

**O que falar:**  
“Cada tecla dispara **`filter`** no array. A interface **reconstrói** só os livros que passam no critério. O contador de resultados atualiza junto.”

---

### Momento C — Gênero, vazio e limpar (60 s)

**O que fazer:**

1. Clique no chip **Romance** (ou outro gênero).
2. Limpe a busca; mostre o subconjunto filtrado.
3. Digite **`asdfgh`** — mostre **sem resultados** e **Limpar filtros**.
4. Clique em **Limpar filtros**.

---

### Momento D — Modal e DevTools (60 s)

**O que fazer:**

1. Clique em um livro → modal com ficha.
2. Feche com **Esc**.
3. F12 → Elements → `#lista-produtos` — digite no filtro e mostre os nós mudando.

**O que falar:**  
“Aqui está o **DOM** vivo: cada busca esvazia o contêiner e **volta a criar** os elementos com `createElement` e `appendChild`.”

---

### Momento E — Código (45 s)

**Onde mostrar:** VS Code com `dados-acervo.js` e `app.js`.

1. `PRODUTOS_ACERVO` — fonte dos dados.
2. Listener em `#filtro`.
3. `obterFiltrados` — **`filter`**.
4. `renderizar` — remontagem do catálogo.

---

## 6. Glossário rápido

| Termo | Explicação curta |
|-------|-------------------|
| DOM | Representação em árvore da página; o JS adiciona/remove nós. |
| Event listener | Função registrada para rodar quando um evento acontece (`input`, `click`). |
| `filter` | Retorna um **novo** array só com itens que passam no teste. |
| `map` | Transforma cada item (ex.: preço formatado). |
| `forEach` | Executa uma função **para cada** elemento (ex.: `appendChild`). |

---

## 7. Se você “não entendeu nada” — memorize só isto

1. **Dados** = `PRODUTOS_ACERVO` em `dados-acervo.js`.  
2. **Gatilho** = usuário digita ou escolhe gênero → eventos `input` / clique.  
3. **Cérebro** = `obterFiltrados` (filter) + `renderizar` (DOM).  
4. **Prova** = F12 → ver nós dentro de `#lista-produtos` mudando.

---

## 8. Perguntas frequentes

**“Por que não usar só `innerHTML`?”**  
`createElement` deixa claro **nó a nó** e evita montar HTML a partir de strings com dados.

**“O CSS conta para a nota de JavaScript?”**  
O foco da disciplina é DOM + arrays + eventos; o CSS melhora a **percepção** do protótipo.

---

*Ensaie uma vez em voz alta com este arquivo ao lado: em 5–6 minutos você fixa o roteiro.*
