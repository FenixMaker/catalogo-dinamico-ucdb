# Catálogo dinâmico — Entender do zero + onde mostrar + o que falar

Use este arquivo como **roteiro de ensaio**. Leia a seção “Entenda em 2 minutos” antes da apresentação; na hora, siga a seção **§5 — Apresentação passo a passo** com a tela aberta.

---

## 0. Antes de ligar o projetor (checklist)

| Verificação | Onde |
|-------------|------|
| Pasta do trabalho aberta no Explorador | `catalogo-dinamico` |
| Arquivos que você pode abrir se perguntarem | `index.html`, `app.js`, `styles.css`, pasta `capas/` |
| Página no navegador | Preferência: `http://127.0.0.1:PORTA` (veja §3). Se não tiver servidor, abra `index.html` direto. |
| Navegador em tela cheia ou só a aba do catálogo | Para não aparecer e-mail / abas pessoais. |

---

## 1. Entenda em 2 minutos (o que esse projeto **é**)

Imagine uma **planilha de livros** no JavaScript (array `produtos`). O site **não recarrega** quando você digita: o script **lê** o que você digitou, **filtra** a planilha na memória e **redesenha** os cartões na página.

- **DOM** = a árvore de elementos que o navegador montou a partir do HTML (`<div>`, `<article>`, etc.). Você **muda** essa árvore com JavaScript.
- **Evento** = “algo aconteceu” (usuário digitou, clicou, apertou tecla). O script **escuta** com `addEventListener`.
- **filter / map / forEach** = formas de percorrer o array: filtrar itens, transformar dados, e para cada item **criar** um pedaço de interface.

**Uma frase para abrir a boca:**  
“É um catálogo estático cujo JavaScript **reage ao input**, filtra o array em memória e **recria os nós do DOM** a cada tecla, sem `location.reload`.”

---

## 2. Cada arquivo e cada parte da tela — o que é (coisas que você pode nunca ter visto)

### `index.html` — estrutura (esqueleto)

| O que tem | Para que serve |
|-----------|----------------|
| `<header>`, `<main>`, `<section>` | Organizam a página. O navegador monta o **DOM inicial** a partir dessas tags. |
| `id="filtro"` | O campo de busca. O JavaScript usa **`getElementById("filtro")`** para anexar o **listener** de teclado. |
| `id="lista-produtos"` | Um `<div>` que começa **vazio** no HTML; o script **coloca** os cartões aqui com `appendChild`. |
| `id="mensagem-vazio"` | Texto “Nenhum resultado…”. O JS **não apaga** o elemento; só troca **classes** para mostrar ou esconder. |
| `aria-live="polite"` | Atributo de **acessibilidade**: leitores de tela podem anunciar que a lista mudou. |
| Links do Google Fonts | Carregam fontes pela internet (só **aparência**; não é a lógica do trabalho). |

### `styles.css` — aparência (visual)

| Você pode ver… | Significado |
|----------------|-------------|
| `:root { --bg: ...; --primary: ... }` | **Variáveis CSS**: nomes para cores/tamanhos; a paleta editorial fica centralizada aqui. |
| `.cartao:hover` | Estilo quando o **mouse passa** em cima do cartão (elevação/sombra). |
| `.busca__limpar--oculto` | Classe que **esconde** o botão Limpar sem remover do HTML (acessível para leitores de tela com `visibility`/`clip` no seu projeto). |
| `@media (prefers-reduced-motion: reduce)` | Respeita quem pediu **menos animação** no Windows/macOS. |

### `app.js` — comportamento (núcleo pedido na disciplina)

| Trecho | O que faz |
|--------|-----------|
| `var produtos = [ ... ]` | **Array** de objetos: cada objeto é um livro (nome, autor, preço…). Fonte dos dados **em memória**. |
| `var termoBusca = ""` | **Estado**: o que a pessoa digitou (o “filtro atual”). |
| `normalizar(texto)` | Coloca minúsculas, tira acentos (**NFD**): busca funciona melhor. |
| `obterFiltrados()` | Usa **`.filter`** no array `produtos`. |
| `renderizar()` | Usa **`replaceChildren()`** para esvaziar a grade; **`.map`** para preparar dados; **`.forEach`** para anexar cartões. |
| `montarCartao(dados, indice)` | **`document.createElement`**, `<img>` da capa (Open Library + fallback), **`appendChild`**: monta um `<article>` por livro. |
| `addEventListener("input", …)` | **Evento**: cada mudança no campo chama `renderizar()` de novo. |

### O que você vê no **navegador** (cada região)

| Na tela | O que é (ligação técnica) |
|---------|---------------------------|
| Título e texto do topo | HTML estático + CSS. |
| Caixa de busca e botão Limpar | HTML; o botão **aparece some** por **classe CSS** controlada pelo JS. |
| Cartões com capa, título, autor, tag, preço | **Não** estão escritos no HTML; são **criados pelo JS** a cada filtro. |
| Rodapé “Protótipo acadêmico…” | HTML estático. |

### Dentro do **DevTools** (tecla **F12**) — aba **Elementos**

| O que expandir | O que dizer na aula |
|----------------|---------------------|
| `#lista-produtos` | “Aqui dentro só existem os `<article>` porque o JavaScript **injetou** eles.” |
| Ao digitar no filtro | “A árvore **muda**: prova de manipulação do **DOM**.” |

### Aba **Console** e **Network**

| Aba | Neste projeto |
|-----|----------------|
| **Console** | Pode ficar vazia — não usamos `console.log` para o fluxo principal. |
| **Network** | Com `http://`, aparecem **CSS**, **app.js** e pedidos **JPEG** das capas (`covers.openlibrary.org`). Com `file://`, o comportamento pode variar (capas externas). |

---

## 3. Onde abrir na tela (para não dar erro na hora)

### Opção recomendada — servidor local

1. Abra a pasta `catalogo-dinamico`.
2. Dê duplo clique em **`servidor-local.bat`** (ou `iniciar-catalogo.bat`, se existir).
3. No navegador, abra **`http://127.0.0.1:8765/index.html`** (porta **8765** no Python; a **5500** costuma ser do **Live Server** do VS Code — outro projeto ou versão antiga).

**Por quê:** alguns navegadores limitam script em `file://`; com `http://` as fontes (Google Fonts) e as **capas** (Open Library) também carregam melhor.

### Capas reais (Open Library)

- Cada livro tem **`imagem`** (capa em **Wikimedia / Wikipédia**, URL estável) e **`isbn`** para reserva via Open Library.
- A URL da Open Library segue [Open Library Covers](https://openlibrary.org/dev/docs/api/covers): `https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg` (muitas vezes devolve um GIF 1×1 “vazio” sem erro de rede; o script tenta a próxima fonte).
- Se a capa não existir, o script tenta o ISBN alternativo e, por fim, o arquivo local **`capas/fallback.svg`**.

### Skill global de UI (opcional, fora do projeto)

Para instalar a skill **frontend-design** da Anthropic no nível de usuário (disponível em qualquer pasta no agente que use o ecossistema Skills):

`npx skills add anthropics/skills --skill frontend-design -g -y`

### Se o CSS/JS parecer “antigo”

Feche abas antigas, use **Ctrl+F5** (recarregar sem cache) ou aumente o sufixo **`?v=`** nos links de `styles.css` e `app.js` no `index.html`.

### Opção rápida — arquivo direto

Duplo clique em **`index.html`**. Se a página funcionar, pode usar na apresentação.

---

## 4. O que o trabalho pede ↔ onde está no projeto

| O professor quer ver | Onde você **mostra** | Onde está no **código** |
|----------------------|----------------------|-------------------------|
| Filtro em tempo real, sem F5 | **Campo “Buscar na lista”** no topo da página | `app.js` — listener `input` em `#filtro` |
| `filter`, `map`, `forEach` | Diga que abrirá o arquivo e **role** até as funções | `obterFiltrados` → `filter`; dentro do predicado, `map` nos campos; `renderizar` → `map` + `forEach` |
| `createElement` / `appendChild` | Opcional: F12 → Elements e mostrar `<article class="cartao">` aparecendo | Função **`montarCartao`** no `app.js` |
| Estado vazio (“nenhum resultado”) | Digite `zzz` ou `qwerty` no filtro | `renderizar()` + classes `catalogo--sem-resultados` / `catalogo__vazio` |
| Limpar / fluxo | Botão **Limpar** ou tecla **Escape** | `limparFiltro`, `atualizarBotaoLimpar` |

Arquivos: **`index.html`** (estrutura), **`styles.css`** (cores, fontes, cartões), **`app.js`** (toda a lógica pedida na disciplina).

---

## 5. Apresentação passo a passo (copie o roteiro na hora)

**Tempo total sugerido:** 3 a 5 minutos. Fale devagar; não precisa decorar palavra por palavra.

---

### Momento A — Abrir e contextualizar (30 s)

**Onde mostrar:** navegador com o catálogo na tela cheia.

**O que falar:**  
“Este é um catálogo de títulos em HTML/CSS/JavaScript **puro**. Os dados estão em um **array** no arquivo `app.js`. O usuário **filtra em tempo real**: cada tecla dispara uma nova leitura do array e uma **nova montagem** da lista na página, **sem recarregar**.”

*(Aponte com o cursor o campo de busca e a grade de cartões.)*

---

### Momento B — Demonstrar filtro (45 s)

**Onde mostrar:** ainda no navegador, no campo de busca.

**O que fazer:**

1. Clique no campo **“Buscar na lista”** (ou tab até ele).
2. Digite devagar: **`Machado`**.

**O que falar:**  
“Enquanto digito, o evento **`input`** roda de novo. O código usa **`Array.prototype.filter`** para manter só os livros cujo nome, autor, categoria ou descrição contêm o texto. A lista **atualiza na hora**.”

---

### Momento C — Estado vazio + limpar (45 s)

**Onde mostrar:** mesmo campo.

**O que fazer:**

1. Apague e digite **`asdfgh`** (algo que não existe).
2. Mostre a mensagem **“Nenhum resultado encontrado”** e o botão **Limpar**.
3. Clique em **Limpar** (ou **Escape**).

**O que falar:**  
“Quando o filtro zera o conjunto, entram classes CSS na seção do catálogo para o estado **sem resultados** e mostro a mensagem. O botão **Limpar** e a tecla **Escape** chamam a mesma função que zera o termo e **renderiza de novo** a lista completa.”

---

### Momento D — Provar DOM no DevTools (60 s) — *muito forte se o professor for técnico*

**Onde mostrar:** **Chrome / Edge** — tecla **F12** (ou Ctrl+Shift+I) → aba **“Elements”** / **“Elementos”**.

**O que fazer:**

1. Com F12 aberto, expanda o HTML até achar **`id="lista-produtos"`** (dentro da `<section id="secao-catalogo">`).
2. Digite uma letra no filtro e **pare**.
3. Mostre que, dentro de `#lista-produtos`, os **`<article class="cartao">`** mudam de quantidade ou somem.

**O que falar:**  
“Aqui está o **DOM** vivo. Cada busca o script **esvazia** o contêiner com `replaceChildren` e **volta a criar** cada cartão com `document.createElement` e `appendChild`. Por isso é manipulação explícita da árvore, não um reload da página.”

---

### Momento E — Abrir o código (45 s)

**Onde mostrar:** **Visual Studio Code** (ou Bloco de Notas) com `app.js`.

**O que fazer (ordem de rolagem):**

1. Mostre o array **`produtos`** no topo (dados).
2. Role até **`inputFiltro.addEventListener("input", ...)`** — diga: “aqui ligo o teclado ao filtro”.
3. Role até **`obterFiltrados`** — diga: “aqui está o **`filter`**”.
4. Role até **`renderizar`** — diga: “aqui limpo a lista e o **`forEach`** chama **`montarCartao`**”.
5. Role até **`montarCartao`** — diga: “aqui estão **`createElement`** e **`appendChild`**”.

**O que falar (fechamento):**  
“Separo três camadas: **dados** no array, **lógica** no filtro e na renderização, e **apresentação** no CSS. O trabalho da disciplina está concentrado no `app.js`.”

---

## 6. Glossário rápido (se perguntarem)

| Termo | Explicação curta |
|-------|-------------------|
| DOM | Representação em árvore da página; o JS adiciona/remove nós. |
| Event listener | Função registrada para rodar quando um evento acontece (`input`, `click`). |
| `filter` | Retorna um **novo** array só com itens que passam no teste. |
| `map` | Retorna um **novo** array transformando cada item (ex.: texto normalizado ou preço formatado). |
| `forEach` | Executa uma função **para cada** elemento, sem criar array novo (bom para efeitos colaterais como `appendChild`). |

---

## 7. Se você “não entendeu nada” — memorize só isto

1. **Dados** = array `produtos` no `app.js`.  
2. **Gatilho** = usuário digita → evento `input`.  
3. **Cérebro** = `obterFiltrados` (filter) + `renderizar` (limpa DOM, forEach, montarCartao).  
4. **Prova** = F12 → ver `<article>` dentro de `#lista-produtos` mudando.

Se souber explicar esses quatro pontos, você **já entendeu** o núcleo do trabalho.

---

## 8. Perguntas frequentes (respostas curtas)

**“Por que não usar só `innerHTML`?”**  
Porque `createElement` deixa claro **nó a nó** e evita montar string HTML com dados (hoje os dados são fixos no JS; em API real isso ajuda contra XSS).

**“O CSS conta para a nota de JavaScript?”**  
O foco da disciplina é DOM + arrays + eventos; o CSS só melhora a **percepção** do protótipo. A nota técnica está no `app.js`.

---

## 9. Sobre uso de IA

Frase honesta:  
“Usei apoio para organizar o texto e o visual, mas o fluxo **evento → filtro → renderização do DOM** eu consigo apontar no `app.js` e reproduzir na demonstração.”

---

*Ensaie uma vez em voz alta com este arquivo ao lado: em 5 minutos você fixa o roteiro.*
