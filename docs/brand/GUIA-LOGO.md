# Guia para criar a logo — Livraria Almanaque

A identidade visual oficial do site está em:

| Arquivo | Uso |
|---------|-----|
| `logo-com-texto.png` | Cabeçalho do site e README |
| `logo-icon.png` | Favicon (aba do navegador) |

Este documento permanece como referência de cores e tipografia. As logos definitivas já foram aplicadas.

---

## 1. A marca

| Item | Valor |
|------|--------|
| **Nome** | **Livraria Almanaque** |
| **Conceito** | Livraria independente com foco em **literatura brasileira**; o nome remete a almanaque (registro anual, fichas, curadoria). |
| **Tagline** | *Literatura brasileira · Campo Grande* |
| **Tom** | Editorial, acolhedor, sério sem ser corporativo — como uma livraria de bairro com acervo cuidadoso. |
| **Público** | Leitores, estudantes de Letras, visitantes do catálogo digital. |

---

## 2. Paleta oficial (já usada no site)

Copie estes valores no seu programa de design:

| Nome | Hex | Uso |
|------|-----|-----|
| **Fundo escuro** | `#141110` | Fundo do site e versão escura da logo |
| **Pergaminho** | `#ebe4d8` | Texto principal / nome da livraria |
| **Ouro editorial** | `#c4933a` | Destaques, contornos, ícone |
| **Ouro claro** | `#e0b35c` | Gradientes e hover |
| **Ouro escuro** | `#8f6a28` | Sombra do gradiente |
| **Terracota** | `#a67c52` | Subtítulo “LIVRARIA” |
| **Cinza legenda** | `#7d746a` | Tagline pequena |

**Evite:** azul tech, verde neon, roxo startup — fogem do clima de livraria.

---

## 3. Tipografia sugerida

| Uso | Fonte | Onde baixar |
|-----|--------|-------------|
| Nome **Almanaque** | **Cormorant Garamond** (serifada, elegante) | [Google Fonts](https://fonts.google.com/) |
| Palavra **LIVRARIA** | Mesma família, peso regular, **caixa alta**, espaçamento entre letras +15–20% | — |
| Tagline | **Outfit** (sem serifa, leve) | Google Fonts |

No site usamos: **Cormorant Garamond** (títulos), **Lora** (textos), **Outfit** (botões e UI).

---

## 4. O que desenhar (símbolo + texto)

### Símbolo (ícone)

Escolha **uma** ideia principal (ou combine com moderação):

1. **Livro aberto** visto de frente (duas páginas), como um almanaque — é o que a logo provisória usa.
2. **Lombadas em fila** (3–5 retângulos finos), lembrando a estante do catálogo.
3. **Letra “A”** estilizada com uma linha horizontal no meio (página aberta).
4. **Carimbo circular** discreto com “LA” ou “1987” (ano fictício de fundação).

Regras do ícone:

- Funcionar em **32×32 px** (favicon) e em **512×512 px** (redes).
- Poucos detalhes; sem fotos nem gradientes complexos demais no favicon.
- Contorno ou preenchimento em **ouro** `#c4933a` sobre fundo `#141110`.

### Logotipo (texto)

Layout horizontal recomendado:

```
[ ícone ]   LIVRARIA
            Almanaque
            Literatura brasileira · Campo Grande
```

- **Almanaque** é a palavra mais importante (maior).
- **LIVRARIA** menor, acima, em capitals.
- Tagline opcional na logo completa; na versão compacta pode sumir.

---

## 5. Versões que você deve exportar

| Arquivo | Tamanho | Fundo | Onde usar |
|---------|---------|--------|-----------|
| `logo.svg` | vetor, ~420×96 px viewBox | transparente ou `#141110` | Cabeçalho do site, README GitHub |
| `logo-clara.svg` | vetor | transparente, traços escuros `#141110` | Impressão em papel claro |
| `icon.svg` | vetor 64×64 | `#141110` ou transparente | Favicon, atalho mobile |
| `icon-512.png` | 512×512 | `#141110` | Open Graph / compartilhar link |
| `favicon.ico` | 32×32 (multi) | — | Aba do navegador |

Depois de criar, coloque os arquivos em **`docs/brand/`** e atualize o `index.html` se mudar o nome dos arquivos.

---

## 6. Passo a passo no Canva (grátis)

1. Criar design **Logo** 500×500 px.
2. Fundo: cor `#141110` (ou transparente para exportar PNG).
3. **Elementos → Formas**: dois retângulos lado a lado = páginas do livro; inclinar levemente se quiser dinamismo.
4. **Texto**: “LIVRARIA” (Fraunces ou Cormorant, pequeno, cor `#a67c52`).
5. **Texto**: “Almanaque” (maior, `#ebe4d8`).
6. Alinhar ícone à esquerda e textos à direita.
7. **Compartilhar → Baixar → SVG** (Canva Pro) ou **PNG** alta resolução e converter em [vectorizer.io](https://www.vectorizer.io/) se precisar de SVG.
8. Redimensionar cópia para 512×512 → salvar como `icon-512.png`.

---

## 7. Passo a passo no Figma (recomendado para vetor)

1. Frame **420 × 96** (logo horizontal) e frame **64 × 64** (ícone).
2. Criar **Color styles** com os hex da tabela acima.
3. Desenhar ícone com **Pen tool** ou retângulos + **Union**.
4. Textos como componentes; fixar fonte Fraunces / DM Sans.
5. **Export** → SVG (logo) e PNG 1x, 2x para ícone.
6. Opcional: variante `logo / compact` só com ícone + “Almanaque”.

---

## 8. Instalar sua logo no site

1. Substitua `docs/brand/logo-com-texto.png` e `docs/brand/logo-icon.png` pelas versões finais.
2. Mantenha `docs/brand/logo.svg` e `docs/brand/icon.svg` como referência vetorial.
3. No `index.html`, confira:

```html
<link rel="icon" href="docs/brand/logo-icon.png" type="image/png" />
<img src="docs/brand/logo-icon.png" alt="Livraria Almanaque" class="site-header__logo" />
```

4. Se mudar proporção da logo, ajuste em `styles.css` a classe `.site-header__logo` (altura ~44–52 px na barra do topo).
5. Atualize o README: imagem em `docs/brand/logo-com-texto.png`.

---

## 9. Checklist antes de considerar pronta

- [ ] Legível em tamanho pequeno (favicon)?
- [ ] Contraste bom no fundo escuro `#141110`?
- [ ] Não parece logo de app de delivery / startup?
- [ ] Nome **Almanaque** fácil de ler de longe?
- [ ] Você tem versão só ícone (sem texto) para favicon?
- [ ] Exportou SVG + PNG 512?

---

## 10. Inspirações (referência de estilo, não copiar)

- Livrarias independentes com identidade **serifada** e cores quentes (madeira, ouro, creme).
- Capas de clássicos brasileiros (Machado, Guimarães Rosa) — paleta terrosa, não neon.
- Selos editoriais antigos e fichas de biblioteca (reforça “almanaque / catálogo”).

---

*Livraria Almanaque · identidade para o catálogo digital UCDB 2026*
