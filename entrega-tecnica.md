# Catálogo dinâmico de produtos em JavaScript: manipulação do DOM, arrays e eventos

**Disciplina / curso e autoria:** constar na capa do PDF entregue.  
**Data:** abril de 2026  

---

## 1. Problema e objetivo

Em páginas estáticas, localizar itens em uma lista longa costuma exigir rolagem e leitura linear. O objetivo deste trabalho é construir um **catálogo de títulos** em que o usuário **filtra em tempo real** ao digitar, **sem recarregar** a página. A solução deve demonstrar domínio de três eixos da linguagem JavaScript no navegador: a **árvore DOM**, **métodos de array** (`filter`, `map`, `forEach`) e **programação baseada em eventos** (listeners).

---

## 2. Fundamentação teórica

### 2.1 Document Object Model (DOM)

O HTML enviado pelo servidor é interpretado pelo navegador como uma **árvore de nós**: documento, elementos, texto e atributos. O JavaScript expõe essa árvore por meio de objetos que podem ser **consultados e alterados** (inclusão/remoção de nós, mudança de texto, classes CSS). A interface passa a ser um reflexo do estado mantido no script: ao atualizar o DOM, o usuário vê a lista mudar instantaneamente (Flanagan, 2020; MDN, s.d.a).

No protótipo, a troca de **classes** no contêiner do catálogo (por exemplo, indicando ausência de resultados) separa o **estado visual** da marcação estática inicial, alinhada à ideia de “documento vivo” descrita na documentação da plataforma Web.

### 2.2 Arrays e dados em memória

A lista de produtos é modelada como um **array de objetos** em memória. Três métodos nativos organizam o fluxo:

- **`filter`** reduz o conjunto aos itens que atendem ao critério de busca (substring no texto normalizado de nome, autor, categoria e descrição).
- **`map`** deriva uma nova lista com campos prontos para exibição (no código, preço já formatado em reais), mantendo a renderização desacoplada da formatação espalhada no laço.
- **`forEach`** percorre os itens filtrados e **materializa** cada cartão no DOM.

Essa combinação evita misturar lógica de filtro com detalhes de construção de cada nó e corresponde ao uso idiomático de coleções em JavaScript (MDN, s.d.b).

### 2.3 Eventos e listeners

O navegador **notifica** o script quando algo ocorre na página (digitação, clique, tecla). Registramos um **listener** no campo de busca para o evento `input`, de modo que **cada alteração** no valor dispare nova filtragem e nova renderização. O botão “Limpar” e a tecla `Escape` (quando há texto) reutilizam uma mesma rotina que zera o termo, redesenha a lista completa e **devolve o foco** ao campo, melhorando o fluxo para quem usa teclado (MDN, s.d.c).

---

## 3. Implementação (visão geral)

O protótipo está nos arquivos `index.html` (estrutura), `styles.css` (apresentação) e `app.js` (comportamento). Os dados ficam no array `produtos`; o termo digitado é guardado em `termoBusca`. A função `obterFiltrados()` aplica `filter` (e, dentro do predicado, `map` para normalizar cada campo pesquisável). A função `renderizar()`:

1. esvazia o contêiner da grade com `replaceChildren()`;
2. alterna classes no elemento da seção para mostrar ou ocultar a mensagem **“Nenhum resultado encontrado”**;
3. usa `map` para obter `paraExibir` com `precoFormatado`;
4. usa `forEach` chamando `montarCartao`, que emprega `document.createElement` e `appendChild` para cada `article` do catálogo.

O botão “Limpar” só aparece quando há texto no filtro **ou** quando a seção está no estado sem resultados (e ainda existem produtos na base), reduzindo ruído visual quando a lista inteira está visível.

---

## 4. Resultados esperados e verificação

| Resultado | Como observar no protótipo |
|-----------|----------------------------|
| Lista reage ao digitar | Digitar no campo “Filtrar”; cartões somem e aparecem sem F5. |
| Manipulação via DOM | Inspecionar a grade: nós criados/removidos a cada busca. |
| Estado vazio | Buscar um termo inexistente; mensagem “Nenhum resultado encontrado.” |
| Limpeza do filtro | Botão “Limpar” ou `Escape` com texto no campo; lista volta completa; foco no input. |

**Figuras (inserir capturas de tela no documento final entregue em PDF):**

- Figura 1 — Catálogo com todos os itens visíveis.  
- Figura 2 — Filtro ativo com subconjunto de títulos.  
- Figura 3 — Estado vazio (nenhum resultado).  
- Figura 4 — Após limpar o filtro, lista completa restaurada.  

---

## 5. Conclusão

O exercício mostra que é possível obter comportamento **reativo** com JavaScript “puro”: o estado (termo de busca + array fonte) determina o subconjunto exibido, e a camada de apresentação é **reconstruída** a partir desse estado com métodos de array e APIs do DOM. A separação entre filtro (`filter`/`map`), derivação para exibição (`map`) e materialização (`forEach` + `createElement`/`appendChild`) facilita leitura do código e atende aos requisitos da disciplina.

---

## Referências

Flanagan, D. *JavaScript: The Definitive Guide*. 7. ed. O’Reilly, 2020.

MDN Web Docs (s.d.a). *Introduction to the DOM*. https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction  

MDN Web Docs (s.d.b). *Array*. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array  

MDN Web Docs (s.d.c). *EventTarget.addEventListener()*. https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener  

---

*Nota: ajuste capa, normas ABNT da UCDB (se exigidas) e figuras antes da entrega formal.*

**Guia de uso e roteiro de apresentação (boca a boca):** [COMO_USAR_E_APRESENTAR.md](COMO_USAR_E_APRESENTAR.md)
