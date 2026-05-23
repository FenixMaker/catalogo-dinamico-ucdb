# Catálogo dinâmico de produtos em JavaScript: manipulação do DOM, arrays e eventos

**Projeto:** Livraria Almanaque — catálogo digital de literatura brasileira (UCDB 2026, Letras).  
**Disciplina / curso e autoria:** constar na capa do PDF entregue.  
**Data:** maio de 2026  

---

## 1. Problema e objetivo

Em páginas estáticas, localizar itens em um acervo longo costuma exigir rolagem e leitura linear. O objetivo deste trabalho é construir um **catálogo de títulos** em que o usuário **filtra em tempo real** ao digitar e ao escolher gênero, **sem recarregar** a página. A solução demonstra domínio de três eixos da linguagem JavaScript no navegador: a **árvore DOM**, **métodos de array** (`filter`, `map`, `forEach`) e **programação baseada em eventos** (listeners).

---

## 2. Fundamentação teórica

### 2.1 Document Object Model (DOM)

O HTML enviado pelo servidor é interpretado pelo navegador como uma **árvore de nós**. O JavaScript expõe essa árvore por meio de objetos que podem ser **consultados e alterados**. No protótipo, a lista de livros **não** está fixa no HTML: o script esvazia o contêiner e **recria** os elementos a cada filtro, alternando também classes para estados como “sem resultados”.

### 2.2 Arrays e dados em memória

A lista de obras está no array `PRODUTOS_ACERVO` (`dados-acervo.js`, 350 títulos). Três métodos nativos organizam o fluxo:

- **`filter`** reduz o conjunto aos itens que atendem ao critério (texto normalizado + gênero opcional).
- **`map`** deriva campos prontos para exibição (preço formatado, textos normalizados).
- **`forEach`** percorre o subconjunto filtrado e **materializa** cada cartão ou lombada no DOM.

### 2.3 Eventos e listeners

Registramos listeners no campo de busca (`input`), nos chips de gênero (`click`), nos botões Estante/Capas e no modal (fechar com `Escape` ou clique). Cada evento atualiza o estado interno e dispara nova renderização.

---

## 3. Implementação (visão geral)

| Arquivo | Papel |
|---------|--------|
| `index.html` | Estrutura: hero, filtros, catálogo, modal |
| `styles.css` | Tema editorial, estante 3D, grade de capas, modal |
| `dados-acervo.js` | Array `PRODUTOS_ACERVO` (dados) |
| `app.js` | Filtros, renderização, modal, persistência de modo |

Fluxo principal: o termo digitado e o gênero selecionado alimentam `obterFiltrados()` (`filter`). `renderizar()` limpa `#lista-produtos`, aplica classes de estado vazio quando necessário e monta a estante ou a grade com `createElement` / `appendChild`.

Funcionalidades além do núcleo da disciplina: **dois modos de visualização**, **chips de gênero**, **modal de ficha** e **capas externas** (Open Library / Wikimedia com fallback local).

---

## 4. Resultados esperados e verificação

| Resultado | Como observar no protótipo |
|-----------|----------------------------|
| Lista reage ao digitar | Campo “Consultar o catálogo da livraria”; obras somem e aparecem sem F5. |
| Filtro por gênero | Chips em “Navegar por gênero”; combina com a busca textual. |
| Manipulação via DOM | Inspecionar `#lista-produtos`: nós recriados a cada filtro. |
| Estado vazio | Buscar termo inexistente; mensagem orientativa e **Limpar filtros**. |
| Ficha da obra | Clicar em um livro; modal com metadados e sinopse. |
| Modos Estante / Capas | Alternar visualização; preferência na sessão. |

**Figuras (capturas em `docs/screenshots/`):**

| Figura | Arquivo sugerido |
|--------|------------------|
| Hero e estante | `01-hero-estante.png` |
| Modo capas | `02-modo-capas.png` |
| Busca ativa | `03-busca-machado.png` |
| Filtro por gênero | `04-filtro-genero.png` |
| Sem resultados | `05-sem-resultados.png` |
| Modal ficha | `06-modal-ficha.png` |
| Detalhe da estante | `07-estante-detalhe.png` |

Regenerar: `python scripts/capturar-screenshots.py`.

---

## 5. Conclusão

O exercício mostra comportamento **reativo** com JavaScript puro: estado (termo + gênero + modo) determina o subconjunto exibido, e a camada de apresentação é **reconstruída** a partir desse estado. A separação entre dados (`dados-acervo.js`), lógica (`app.js`) e apresentação (`styles.css`) facilita leitura do código e atende aos requisitos da disciplina, estendendo o protótipo a um catálogo editorial completo da Livraria Almanaque.

---

## Referências

Flanagan, D. *JavaScript: The Definitive Guide*. 7. ed. O’Reilly, 2020.

MDN Web Docs (s.d.a). *Introduction to the DOM*. https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction  

MDN Web Docs (s.d.b). *Array.prototype.filter*. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter  

MDN Web Docs (s.d.c). *EventTarget.addEventListener()*. https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener  

---

*Nota: ajuste capa, normas ABNT da UCDB (se exigidas) e figuras antes da entrega formal.*

**Guia de uso e roteiro de apresentação (boca a boca):** [COMO_USAR_E_APRESENTAR.md](COMO_USAR_E_APRESENTAR.md)
