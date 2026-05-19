(function () {
  "use strict";

  /** Capas: Open Library (ISBN). Ver COMO_USAR_E_APRESENTAR.md. */
  var OL_CAPA = "https://covers.openlibrary.org/b/isbn/";
  var CAPA_FALLBACK = "capas/fallback.svg";

  var produtos = typeof PRODUTOS_ACERVO !== "undefined" && Array.isArray(PRODUTOS_ACERVO) ? PRODUTOS_ACERVO : [];

  var inputFiltro = document.getElementById("filtro");
  var btnLimpar = document.getElementById("btn-limpar");
  var secaoCatalogo = document.getElementById("secao-catalogo");
  var listaProdutos = document.getElementById("lista-produtos");
  var mensagemVazio = document.getElementById("mensagem-vazio");
  var catalogoStats = document.getElementById("catalogo-stats");
  var statObras = document.getElementById("stat-obras");
  var statAutores = document.getElementById("stat-autores");
  var statPeriodo = document.getElementById("stat-periodo");
  var statGeneros = document.getElementById("stat-generos");
  var heroDestaque = document.getElementById("hero-destaque");
  var heroFaixaCapas = document.getElementById("hero-faixa-capas");
  var filtrosCategorias = document.getElementById("filtros-categorias");
  var filtrosResumo = document.getElementById("filtros-resumo");

  var modalLivro = document.getElementById("modal-livro");
  var modalBackdrop = document.getElementById("modal-backdrop");
  var modalFechar = document.getElementById("modal-fechar");
  var modalCapa = document.getElementById("modal-capa");
  var modalTitulo = document.getElementById("modal-titulo");
  var modalAutor = document.getElementById("modal-autor");
  var modalSinopse = document.getElementById("modal-sinopse");
  var modalPreco = document.getElementById("modal-preco");
  var modalIsbn = document.getElementById("modal-isbn");
  var modalCategoria = document.getElementById("modal-categoria");
  var modalAno = document.getElementById("modal-ano");
  var modalPaginas = document.getElementById("modal-paginas");
  var modalLombadaTitulo = document.getElementById("modal-lombada-titulo");

  var termoBusca = "";
  var categoriaFiltro = "";
  var modoVisualizacao = "estante";
  try {
    var modoSalvo = sessionStorage.getItem("catalogo-modo");
    if (modoSalvo === "estante" || modoSalvo === "grade") {
      modoVisualizacao = modoSalvo;
    }
  } catch (e) {}
  var botoesModo = document.querySelectorAll(".catalogo__modo");
  var modalAberto = false;
  var livroModalId = null;
  var ultimoCartaoFocado = null;
  var focaveisModal = [];

  function normalizar(texto) {
    if (!texto) return "";
    return String(texto)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function obterProdutoPorId(id) {
    var numId = Number(id);
    for (var i = 0; i < produtos.length; i++) {
      if (produtos[i].id === numId) {
        return produtos[i];
      }
    }
    return null;
  }

  function escapeXml(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function corCapaPlaceholder(id, categoria) {
    var h = (id * 41 + (categoria || "").length * 17) % 360;
    return "hsl(" + h + " 32% 28%)";
  }

  /** Capa SVG única por obra quando não há imagem externa. */
  function capaSvgPlaceholder(produto) {
    var titulo = produto.nome.length > 32 ? produto.nome.slice(0, 30) + "…" : produto.nome;
    var autor =
      produto.autor.length > 26 ? produto.autor.split(" ").slice(-2).join(" ") : produto.autor;
    var cor = corCapaPlaceholder(produto.id, produto.categoria);
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="205" viewBox="0 0 140 205">' +
      '<rect width="140" height="205" fill="' +
      cor +
      '"/>' +
      '<rect x="10" y="10" width="120" height="185" fill="none" stroke="rgba(255,255,255,0.12)"/>' +
      '<text x="70" y="88" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="rgba(255,255,255,0.9)">' +
      escapeXml(titulo) +
      "</text>" +
      '<text x="70" y="108" text-anchor="middle" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.55)">' +
      escapeXml(autor) +
      "</text>" +
      '<text x="70" y="175" text-anchor="middle" font-family="sans-serif" font-size="7" fill="rgba(255,255,255,0.35)">' +
      escapeXml(produto.categoria || "") +
      "</text>" +
      "</svg>";
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function componenteHex(n) {
    var h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return h.length === 1 ? "0" + h : h;
  }

  function rgbParaHex(r, g, b) {
    return "#" + componenteHex(r) + componenteHex(g) + componenteHex(b);
  }

  function hexParaRgb(hex) {
    var h = String(hex).replace("#", "");
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (h.length !== 6) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function misturarRgb(rgb, fator) {
    return rgbParaHex(rgb.r * fator, rgb.g * fator, rgb.b * fator);
  }

  function clarearRgb(rgb, amt) {
    return rgbParaHex(
      Math.min(255, rgb.r + (255 - rgb.r) * amt),
      Math.min(255, rgb.g + (255 - rgb.g) * amt),
      Math.min(255, rgb.b + (255 - rgb.b) * amt)
    );
  }

  function extrairPaletaCapa(img) {
    try {
      var canvas = document.createElement("canvas");
      var w = 32;
      var h = 48;
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      var data = ctx.getImageData(0, 0, w, h).data;
      var sr = 0;
      var sg = 0;
      var sb = 0;
      var n = 0;

      for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var a = data[i + 3];
        if (a < 90) continue;
        var lum = r * 0.299 + g * 0.587 + b * 0.114;
        if (lum < 28 || lum > 248) continue;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var sat = max === 0 ? 0 : (max - min) / max;
        var peso = 1 + sat * 2.5;
        sr += r * peso;
        sg += g * peso;
        sb += b * peso;
        n += peso;
      }

      if (n < 1) return null;

      var rgb = {
        r: sr / n,
        g: sg / n,
        b: sb / n,
      };

      return {
        base: misturarRgb(rgb, 0.82),
        sombra: misturarRgb(rgb, 0.48),
        accent: clarearRgb(rgb, 0.22),
        brilho: clarearRgb(rgb, 0.38),
      };
    } catch (err) {
      return null;
    }
  }

  function paletaFallbackProduto(produto) {
    var c = corLombadaPorCategoria(produto.categoria, produto.id);
    var rgb = hexParaRgb(c.base);
    if (!rgb) {
      return { base: c.base, sombra: c.sombra, accent: c.base, brilho: c.base };
    }
    return {
      base: c.base,
      sombra: c.sombra,
      accent: clarearRgb(rgb, 0.18),
      brilho: clarearRgb(rgb, 0.32),
    };
  }

  function aplicarPaletaNoElemento(el, paleta) {
    if (!el || !paleta) return;
    el.style.setProperty("--cor-lombada", paleta.base);
    el.style.setProperty("--cor-lombada-sombra", paleta.sombra);
    el.style.setProperty("--cor-capa-accent", paleta.accent || paleta.base);
    el.style.setProperty("--cor-capa-brilho", paleta.brilho || paleta.accent || paleta.base);
    el.classList.add("livro--paleta-capa");
  }

  function obterPaletaProduto(produto, artigo) {
    if (produto && produto._paleta) return produto._paleta;
    if (artigo) {
      var base = artigo.style.getPropertyValue("--cor-lombada").trim();
      if (base) {
        return {
          base: base,
          sombra: artigo.style.getPropertyValue("--cor-lombada-sombra").trim() || base,
          accent: artigo.style.getPropertyValue("--cor-capa-accent").trim() || base,
          brilho: artigo.style.getPropertyValue("--cor-capa-brilho").trim() || base,
        };
      }
    }
    return produto ? paletaFallbackProduto(produto) : null;
  }

  function opcoesCapaComPaleta(alvo, produto) {
    var fallback = paletaFallbackProduto(produto);
    if (alvo) aplicarPaletaNoElemento(alvo, fallback);

    return {
      alvo: alvo,
      produto: produto,
      fallbackPaleta: fallback,
      onPaleta: function (paleta) {
        if (produto) produto._paleta = paleta;
        if (!alvo) return;
        aplicarPaletaNoElemento(alvo, paleta);
        var ficha = alvo.querySelector(".livro__ficha");
        if (ficha) aplicarPaletaNoElemento(ficha, paleta);
      },
    };
  }

  function montarFilaCapas(item) {
    var urls = [];
    var visto = {};

    function add(url) {
      if (url && !visto[url]) {
        visto[url] = true;
        urls.push(url);
      }
    }

    add(item.imagem);
    if (item.isbnCatalogo) {
      add(OL_CAPA + item.isbnCatalogo + "-L.jpg");
      add(OL_CAPA + item.isbnCatalogo + "-M.jpg");
    }
    if (item.isbnAlt) {
      add(OL_CAPA + item.isbnAlt + "-L.jpg");
      add(OL_CAPA + item.isbnAlt + "-M.jpg");
    }
    add(capaSvgPlaceholder(item));
    add(CAPA_FALLBACK);
    return urls;
  }

  /** Open Library devolve GIF 1x1 (200 OK) sem capa: avança na fila. */
  function iniciarCapaMultiorigem(img, urls, opts) {
    opts = opts || {};
    urls = urls.filter(function (u) {
      return typeof u === "string" && u.length > 0;
    });
    if (urls.length === 0) {
      return;
    }
    img.referrerPolicy = "no-referrer";
    if (!String(urls[0]).startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    var idx = 0;

    function tentarProxima() {
      if (idx + 1 >= urls.length) {
        return;
      }
      idx += 1;
      if (!String(urls[idx]).startsWith("data:")) {
        img.crossOrigin = "anonymous";
      } else {
        img.removeAttribute("crossorigin");
      }
      img.src = urls[idx];
    }

    function aoCarregarCapa() {
      if (img.naturalWidth <= 1 && img.naturalHeight <= 1) {
        tentarProxima();
        return;
      }
      var paleta = extrairPaletaCapa(img);
      if (!paleta && opts.fallbackPaleta) {
        paleta = opts.fallbackPaleta;
      }
      if (paleta && opts.onPaleta) {
        opts.onPaleta(paleta);
      } else if (paleta && opts.alvo) {
        aplicarPaletaNoElemento(opts.alvo, paleta);
        if (opts.produto) opts.produto._paleta = paleta;
      }
    }

    img.addEventListener("error", tentarProxima);
    img.addEventListener("load", aoCarregarCapa);
    img.src = urls[0];
  }

  function obterCategorias() {
    var mapa = {};
    produtos.forEach(function (p) {
      mapa[p.categoria] = true;
    });
    return Object.keys(mapa).sort(function (a, b) {
      return a.localeCompare(b, "pt-BR");
    });
  }

  function calcularEstatisticasAcervo() {
    var autores = {};
    var anos = [];
    produtos.forEach(function (p) {
      autores[p.autor] = true;
      if (p.ano) anos.push(p.ano);
    });
    anos.sort(function (a, b) {
      return a - b;
    });
    return {
      obras: produtos.length,
      autores: Object.keys(autores).length,
      generos: obterCategorias().length,
      anoMin: anos[0],
      anoMax: anos[anos.length - 1],
    };
  }

  function obterDestaqueDoDia() {
    var indice = new Date().getDate() % produtos.length;
    return produtos[indice];
  }

  function obterFiltrados() {
    var lista = produtos.slice();
    if (categoriaFiltro) {
      lista = lista.filter(function (item) {
        return item.categoria === categoriaFiltro;
      });
    }
    var agulha = normalizar(termoBusca.trim());
    if (!agulha) {
      return lista;
    }
    return lista.filter(function (item) {
      var partes = [item.nome, item.autor, item.categoria, item.descricao, item.descricaoLonga];
      var textoPlano = partes
        .map(function (campo) {
          return normalizar(campo);
        })
        .join(" ");
      return textoPlano.indexOf(agulha) !== -1;
    });
  }

  function montarDestaqueHero(produto) {
    if (!heroDestaque || !produto) return;
    heroDestaque.replaceChildren();
    heroDestaque.setAttribute(
      "aria-label",
      produto.nome + ", por " + produto.autor + ". Clique para abrir a ficha completa."
    );

    var capaWrap = document.createElement("div");
    capaWrap.className = "hero__destaque-capa";

    var capa = document.createElement("img");
    capa.className = "hero__destaque-img";
    capa.alt = "";
    capa.width = 140;
    capa.height = 205;
    iniciarCapaMultiorigem(capa, montarFilaCapas(produto), {
      fallbackPaleta: paletaFallbackProduto(produto),
      onPaleta: function (p) {
        produto._paleta = p;
        heroDestaque.style.setProperty("--cor-capa-accent", p.accent);
        capaWrap.style.boxShadow = "0 6px 24px color-mix(in srgb, " + p.accent + " 35%, transparent)";
      },
    });

    var corpo = document.createElement("div");
    corpo.className = "hero__destaque-corpo";

    var tag = document.createElement("span");
    tag.className = "hero__destaque-tag";
    tag.textContent = produto.categoria;

    var titulo = document.createElement("h3");
    titulo.className = "hero__destaque-titulo";
    titulo.id = "destaque-titulo";
    titulo.textContent = produto.nome;

    var autor = document.createElement("p");
    autor.className = "hero__destaque-autor";
    autor.textContent = produto.autor;

    var meta = document.createElement("p");
    meta.className = "hero__destaque-meta";
    meta.textContent = produto.ano + " · " + produto.paginas + " pág. · " + formatarPreco(produto.preco);

    var cta = document.createElement("span");
    cta.className = "hero__destaque-cta";
    cta.textContent = "Abrir ficha →";

    capaWrap.appendChild(capa);
    corpo.appendChild(tag);
    corpo.appendChild(titulo);
    corpo.appendChild(autor);
    corpo.appendChild(meta);
    corpo.appendChild(cta);
    heroDestaque.appendChild(capaWrap);
    heroDestaque.appendChild(corpo);

    heroDestaque.onclick = function () {
      abrirDetalhe(produto.id, heroDestaque);
    };
    heroDestaque.onkeydown = function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        abrirDetalhe(produto.id, heroDestaque);
      }
    };
  }

  function montarFaixaCapas() {
    if (!heroFaixaCapas) return;
    heroFaixaCapas.replaceChildren();
    var amostra = produtos.slice(0, 12);
    if (produtos.length > 12) {
      var dia = new Date().getDate();
      amostra = [];
      for (var f = 0; f < 8; f++) {
        amostra.push(produtos[(dia + f * 17) % produtos.length]);
      }
    }
    amostra.forEach(function (p, i) {
      var item = document.createElement("div");
      item.className = "hero__faixa-item";
      item.style.setProperty("--i", String(i));
      var img = document.createElement("img");
      img.alt = "";
      img.width = 80;
      img.height = 118;
      iniciarCapaMultiorigem(img, montarFilaCapas(p));
      item.appendChild(img);
      heroFaixaCapas.appendChild(item);
    });
  }

  function montarChipsCategoria() {
    if (!filtrosCategorias) return;
    filtrosCategorias.replaceChildren();

    function criarChip(rotulo, valor) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filtros__chip";
      btn.textContent = rotulo;
      btn.setAttribute("data-categoria", valor);
      if (valor === categoriaFiltro) {
        btn.classList.add("filtros__chip--ativo");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.setAttribute("aria-pressed", "false");
      }
      btn.addEventListener("click", function () {
        categoriaFiltro = valor;
        renderizar();
      });
      return btn;
    }

    filtrosCategorias.appendChild(criarChip("Todos", ""));
    obterCategorias().forEach(function (cat) {
      filtrosCategorias.appendChild(criarChip(cat, cat));
    });
  }

  function atualizarEstatisticasHero() {
    var stats = calcularEstatisticasAcervo();
    if (statObras) statObras.textContent = String(stats.obras);
    if (statAutores) statAutores.textContent = String(stats.autores);
    if (statPeriodo) statPeriodo.textContent = stats.anoMin + "–" + stats.anoMax;
    if (statGeneros) statGeneros.textContent = String(stats.generos);
  }

  function atualizarResumoFiltros(nExibidos) {
    if (!filtrosResumo) return;
    var partes = [];
    if (categoriaFiltro) partes.push(categoriaFiltro);
    if (termoBusca.trim()) partes.push('busca: "' + termoBusca.trim() + '"');
    if (partes.length === 0) {
      filtrosResumo.textContent = "Todas as categorias · " + nExibidos + " obras visíveis";
    } else {
      filtrosResumo.textContent = partes.join(" · ") + " · " + nExibidos + " resultado" + (nExibidos === 1 ? "" : "s");
    }
  }

  function inicializarHero() {
    atualizarEstatisticasHero();
    montarDestaqueHero(obterDestaqueDoDia());
    montarFaixaCapas();
    montarChipsCategoria();
  }

  function atualizarAriaExpandedCartoes() {
    var seletor = modoVisualizacao === "grade" ? ".cartao-capa" : ".livro";
    var itens = listaProdutos.querySelectorAll(seletor);
    itens.forEach(function (el) {
      var id = el.getAttribute("data-id");
      var expandido = modalAberto && livroModalId !== null && String(livroModalId) === id;
      el.setAttribute("aria-expanded", expandido ? "true" : "false");
    });
  }

  function atualizarBotoesModo() {
    botoesModo.forEach(function (btn) {
      var ativo = btn.getAttribute("data-modo") === modoVisualizacao;
      btn.classList.toggle("catalogo__modo--ativo", ativo);
      btn.setAttribute("aria-pressed", ativo ? "true" : "false");
    });
  }

  function definirModoVisualizacao(modo) {
    if (modo !== "estante" && modo !== "grade") {
      return;
    }
    modoVisualizacao = modo;
    try {
      sessionStorage.setItem("catalogo-modo", modo);
    } catch (e) {}
    atualizarBotoesModo();
    if (livroFichaAtivo) {
      desativarFichaLivro(livroFichaAtivo);
    }
    renderizar();
  }

  var CORES_LOMBADA = {
    Romance: [
      { base: "#8b3a52", sombra: "#5c2438" },
      { base: "#7a3348", sombra: "#4e1f32" },
      { base: "#9c4458", sombra: "#642a3c" },
      { base: "#6e3545", sombra: "#451f2c" },
    ],
    "Romance regional": [
      { base: "#6b4a2e", sombra: "#453018" },
      { base: "#7d5634", sombra: "#523c1e" },
      { base: "#5c4228", sombra: "#3a2814" },
      { base: "#8a6040", sombra: "#5a4028" },
    ],
    "Romance indianista": [
      { base: "#2e6b52", sombra: "#1a4534" },
      { base: "#3a7560", sombra: "#245040" },
      { base: "#266048", sombra: "#163a2c" },
      { base: "#45806a", sombra: "#2c5544" },
      { base: "#356b58", sombra: "#224438" },
    ],
    Modernismo: [
      { base: "#c45c28", sombra: "#8a3d18" },
      { base: "#b85424", sombra: "#7a3616" },
      { base: "#d06830", sombra: "#944420" },
      { base: "#a84e22", sombra: "#723214" },
    ],
    Naturalismo: [
      { base: "#4a5568", sombra: "#2d3544" },
      { base: "#556275", sombra: "#363e4e" },
      { base: "#3f4a5c", sombra: "#282f3c" },
      { base: "#5c6878", sombra: "#3a424f" },
    ],
    "Conto longo": [
      { base: "#5a4a8b", sombra: "#3a2f5c" },
      { base: "#655498", sombra: "#423664" },
      { base: "#4f427e", sombra: "#322854" },
      { base: "#6e60a0", sombra: "#483c6c" },
    ],
    Ficção: [
      { base: "#3a6b7a", sombra: "#244550" },
      { base: "#457888", sombra: "#2c505c" },
      { base: "#325f6c", sombra: "#1e3c46" },
      { base: "#4e8290", sombra: "#345a64" },
    ],
  };

  function corLombadaPorCategoria(categoria, id) {
    var paleta = CORES_LOMBADA[categoria];
    if (Array.isArray(paleta)) {
      return paleta[(id || 0) % paleta.length];
    }
    if (paleta && paleta.base) {
      return paleta;
    }
    return { base: "#5a4f48", sombra: "#3a332e" };
  }

  function dimensoesLombada(id, paginas) {
    var pags = paginas || 200;
    var hash = (id * 17) % 7;
    var espessura = 12 + hash * 2 + Math.min(8, Math.floor(pags / 80));
    var altura = 148 + Math.min(72, Math.floor(pags / 12)) + (hash % 3) * 8;
    return { espessura: espessura, altura: altura };
  }

  var ORDEM_GENEROS = [
    "Romance",
    "Romance regional",
    "Romance indianista",
    "Modernismo",
    "Naturalismo",
    "Conto longo",
    "Ficção",
  ];

  function agruparPorGenero(lista) {
    var mapa = {};
    lista.forEach(function (item) {
      var g = item.categoria;
      if (!mapa[g]) mapa[g] = [];
      mapa[g].push(item);
    });
    return mapa;
  }

  function generosNaOrdem(mapa) {
    var vistos = {};
    var ordem = [];
    ORDEM_GENEROS.forEach(function (g) {
      if (mapa[g] && mapa[g].length) {
        ordem.push(g);
        vistos[g] = true;
      }
    });
    Object.keys(mapa).forEach(function (g) {
      if (!vistos[g]) ordem.push(g);
    });
    return ordem;
  }

  function preencherModal(produto) {
    modalTitulo.textContent = produto.nome;
    modalAutor.textContent = produto.autor;
    modalSinopse.textContent = produto.descricaoLonga || produto.descricao;
    modalPreco.textContent = formatarPreco(produto.preco);
    modalIsbn.textContent = produto.isbn;
    modalCategoria.textContent = produto.categoria;
    modalAno.textContent = produto.ano ? String(produto.ano) : "—";
    modalPaginas.textContent = produto.paginas ? String(produto.paginas) + " pág." : "—";

    if (modalLombadaTitulo) {
      modalLombadaTitulo.textContent = produto.nome;
    }

    var paletaModal = obterPaletaProduto(produto, ultimoCartaoFocado);
    if (modalLivro && paletaModal) {
      modalLivro.style.setProperty("--modal-lombada", paletaModal.base);
      modalLivro.style.setProperty("--modal-lombada-sombra", paletaModal.sombra);
      modalLivro.style.setProperty("--cor-capa-accent", paletaModal.accent);
      modalLivro.style.setProperty("--cor-capa-brilho", paletaModal.brilho || paletaModal.accent);
    }

    var wrap = modalCapa && modalCapa.parentNode;
    if (wrap) {
      var novaCapa = document.createElement("img");
      novaCapa.id = "modal-capa";
      novaCapa.className = "modal__capa";
      novaCapa.width = 320;
      novaCapa.height = 470;
      novaCapa.alt = "Capa da edição — " + produto.nome;
      wrap.replaceChild(novaCapa, modalCapa);
      modalCapa = novaCapa;
      var optsModal = opcoesCapaComPaleta(modalLivro, produto);
      optsModal.alvo = modalLivro;
      iniciarCapaMultiorigem(modalCapa, montarFilaCapas(produto), optsModal);
    }
  }

  function limparClassesModal() {
    if (!modalLivro) return;
    modalLivro.classList.remove("modal--preparando", "modal--ativo", "modal--com-voo", "modal--saindo");
    modalLivro.style.removeProperty("--voo-tx");
    modalLivro.style.removeProperty("--voo-ty");
    modalLivro.style.removeProperty("--voo-scale");
  }

  function aplicarVooDaEstante(artigo) {
    if (!modalLivro || !artigo) return;

    var cubo = modalLivro.querySelector(".modal__livro-3d");
    if (!cubo) return;

    var origem = artigo.getBoundingClientRect();
    var destino = cubo.getBoundingClientRect();

    if (destino.width < 10) {
      return;
    }

    var ox = origem.left + origem.width / 2;
    var oy = origem.top + origem.height / 2;
    var dx = destino.left + destino.width / 2;
    var dy = destino.top + destino.height / 2;

    modalLivro.style.setProperty("--voo-tx", ox - dx + "px");
    modalLivro.style.setProperty("--voo-ty", oy - dy + "px");
    modalLivro.style.setProperty(
      "--voo-scale",
      String(Math.max(0.18, Math.min(0.45, origem.height / destino.height)))
    );
  }

  function ativarModalComAnimacao(artigo) {
    limparClassesModal();
    modalLivro.classList.add("modal--preparando");

    requestAnimationFrame(function () {
      aplicarVooDaEstante(artigo);
      requestAnimationFrame(function () {
        modalLivro.classList.add("modal--com-voo", "modal--ativo");
        modalLivro.classList.remove("modal--preparando");
      });
    });
  }

  function obterFocaveisModal() {
    if (!modalLivro) return [];
    return Array.prototype.slice.call(
      modalLivro.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    );
  }

  function prenderFocoModal(ev) {
    if (!modalAberto || ev.key !== "Tab") return;
    focaveisModal = obterFocaveisModal();
    if (focaveisModal.length === 0) return;
    var primeiro = focaveisModal[0];
    var ultimo = focaveisModal[focaveisModal.length - 1];
    if (ev.shiftKey && document.activeElement === primeiro) {
      ev.preventDefault();
      ultimo.focus();
    } else if (!ev.shiftKey && document.activeElement === ultimo) {
      ev.preventDefault();
      primeiro.focus();
    }
  }

  function abrirDetalhe(id, cartaoOrigem) {
    var produto = obterProdutoPorId(id);
    if (!produto || !modalLivro) return;

    if (livroFichaAtivo) {
      desativarFichaLivro(livroFichaAtivo);
    }

    var artigo =
      cartaoOrigem && cartaoOrigem.classList && cartaoOrigem.classList.contains("livro")
        ? cartaoOrigem
        : document.querySelector('.livro[data-id="' + id + '"]');

    document.querySelectorAll(".livro--retirado").forEach(function (el) {
      el.classList.remove("livro--retirado");
    });

    ultimoCartaoFocado = artigo || cartaoOrigem;
    livroModalId = produto.id;
    modalAberto = true;

    preencherModal(produto);
    modalLivro.removeAttribute("hidden");
    modalLivro.classList.remove("modal--oculto");
    document.body.classList.add("modal-aberta");
    atualizarAriaExpandedCartoes();

    if (artigo) {
      artigo.classList.add("livro--retirado");
      ativarModalComAnimacao(artigo);
    } else {
      limparClassesModal();
      modalLivro.classList.add("modal--ativo");
    }

    if (modalFechar) {
      modalFechar.focus();
    }
  }

  function fecharDetalhe() {
    if (!modalLivro || !modalAberto) return;

    var artigo = ultimoCartaoFocado;
    var finalizar = function () {
      modalAberto = false;
      livroModalId = null;
      limparClassesModal();
      modalLivro.setAttribute("hidden", "");
      modalLivro.classList.add("modal--oculto");
      document.body.classList.remove("modal-aberta");
      document.querySelectorAll(".livro--retirado").forEach(function (el) {
        el.classList.remove("livro--retirado");
      });
      atualizarAriaExpandedCartoes();

      if (artigo && typeof artigo.focus === "function") {
        artigo.focus();
      }
      ultimoCartaoFocado = null;
    };

    if (artigo && artigo.classList && artigo.classList.contains("livro")) {
      modalLivro.classList.add("modal--saindo");
      modalLivro.classList.remove("modal--ativo");
      aplicarVooDaEstante(artigo);
      setTimeout(finalizar, 320);
    } else {
      finalizar();
    }
  }

  var FICHA_MARGEM = 12;
  var livroFichaAtivo = null;

  function obterFichaAtiva(artigo) {
    var id = artigo.getAttribute("data-id");
    return document.querySelector('.livro__ficha[data-livro-id="' + id + '"]');
  }

  function posicionarFichaFlutuante(artigo) {
    var ficha = obterFichaAtiva(artigo);
    if (!ficha || !ficha.classList.contains("livro__ficha--flutuante")) {
      return;
    }

    var livroRect = artigo.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var fichaW = Math.min(304, vw - FICHA_MARGEM * 2);

    ficha.style.width = fichaW + "px";
    var fichaH = ficha.offsetHeight || 140;

    var centroLivro = livroRect.left + livroRect.width / 2;
    var left = centroLivro - fichaW / 2;

    if (centroLivro < vw * 0.35) {
      left = livroRect.left;
    } else if (centroLivro > vw * 0.65) {
      left = livroRect.right - fichaW;
    }

    left = Math.max(FICHA_MARGEM, Math.min(left, vw - fichaW - FICHA_MARGEM));
    ficha.style.left = left + "px";

    var seta = centroLivro - left;
    seta = Math.max(18, Math.min(seta, fichaW - 18));
    ficha.style.setProperty("--ficha-seta", seta + "px");

    var gap = 10;
    var minTopo = 72;
    var espacoAcima = livroRect.top - minTopo;
    var colocarAbaixo = espacoAcima < fichaH + gap;

    ficha.classList.toggle("livro__ficha--abaixo", colocarAbaixo);

    if (colocarAbaixo) {
      var abaixo = livroRect.bottom + gap;
      if (abaixo + fichaH > vh - FICHA_MARGEM) {
        abaixo = Math.max(minTopo, vh - fichaH - FICHA_MARGEM);
      }
      ficha.style.top = abaixo + "px";
    } else {
      ficha.style.top = livroRect.top - gap + "px";
    }
  }

  function ativarFichaLivro(artigo) {
    var ficha = artigo.querySelector(".livro__ficha");
    if (!ficha) {
      return;
    }
    livroFichaAtivo = artigo;
    artigo._fichaSlot = { parent: ficha.parentNode, next: ficha.nextSibling };
    ficha.setAttribute("data-livro-id", artigo.getAttribute("data-id"));
    var paletaFicha = obterPaletaProduto(
      obterProdutoPorId(artigo.getAttribute("data-id")),
      artigo
    );
    if (paletaFicha) aplicarPaletaNoElemento(ficha, paletaFicha);
    document.body.appendChild(ficha);
    ficha.classList.add("livro__ficha--flutuante", "livro__ficha--visivel");
    requestAnimationFrame(function () {
      if (livroFichaAtivo !== artigo) {
        return;
      }
      posicionarFichaFlutuante(artigo);
      requestAnimationFrame(function () {
        if (livroFichaAtivo === artigo) {
          posicionarFichaFlutuante(artigo);
        }
      });
    });
  }

  function desativarFichaLivro(artigo) {
    var ficha = obterFichaAtiva(artigo) || artigo.querySelector(".livro__ficha");
    if (livroFichaAtivo === artigo) {
      livroFichaAtivo = null;
    }
    if (!ficha) {
      return;
    }
    ficha.classList.remove("livro__ficha--flutuante", "livro__ficha--visivel", "livro__ficha--abaixo");
    ficha.style.left = "";
    ficha.style.top = "";
    ficha.style.width = "";
    ficha.style.removeProperty("--ficha-seta");
    ficha.removeAttribute("data-livro-id");
    if (artigo._fichaSlot && artigo._fichaSlot.parent) {
      artigo._fichaSlot.parent.insertBefore(ficha, artigo._fichaSlot.next);
      delete artigo._fichaSlot;
    }
  }

  function montarLivro(dados, indice) {
    var produtoCompleto = obterProdutoPorId(dados.id) || dados;
    var precoFormatado = dados.precoFormatado || formatarPreco(produtoCompleto.preco);
    var dims = dimensoesLombada(dados.id, produtoCompleto.paginas || dados.paginas);

    var artigo = document.createElement("article");
    artigo.className = "livro";
    artigo.setAttribute("data-id", String(dados.id));
    artigo.setAttribute("role", "button");
    artigo.setAttribute("tabindex", "0");
    artigo.setAttribute(
      "aria-label",
      dados.nome + ", por " + dados.autor + ". Passe o mouse na lombada para ver a capa ou Enter para detalhes."
    );
    artigo.setAttribute("aria-expanded", "false");
    artigo.style.setProperty("--espessura", dims.espessura + "px");
    artigo.style.setProperty("--espessura-peso", String(dims.espessura));
    artigo.dataset.espessuraBase = String(dims.espessura);
    artigo.style.setProperty("--altura", dims.altura + "px");
    artigo.style.animationDelay = String(indice * 55) + "ms";

    var optsCapa = opcoesCapaComPaleta(artigo, produtoCompleto);

    var ficha = document.createElement("div");
    ficha.className = "livro__ficha";
    ficha.setAttribute("role", "tooltip");

    var fichaCapa = document.createElement("img");
    fichaCapa.className = "livro__ficha-capa";
    fichaCapa.alt = "";
    fichaCapa.width = 92;
    fichaCapa.height = 135;
    fichaCapa.decoding = "async";
    iniciarCapaMultiorigem(fichaCapa, montarFilaCapas(produtoCompleto), optsCapa);

    var fichaCorpo = document.createElement("div");
    fichaCorpo.className = "livro__ficha-corpo";

    var fichaTitulo = document.createElement("p");
    fichaTitulo.className = "livro__ficha-titulo";
    fichaTitulo.textContent = dados.nome;

    var fichaMeta = document.createElement("p");
    fichaMeta.className = "livro__ficha-meta";
    fichaMeta.textContent = dados.autor;

    var fichaTag = document.createElement("p");
    fichaTag.className = "livro__ficha-tag";
    fichaTag.textContent = dados.categoria;

    var fichaDesc = document.createElement("p");
    fichaDesc.className = "livro__ficha-desc";
    fichaDesc.textContent = dados.descricao;

    var fichaPreco = document.createElement("p");
    fichaPreco.className = "livro__ficha-preco";
    fichaPreco.textContent = precoFormatado;

    var fichaCta = document.createElement("p");
    fichaCta.className = "livro__ficha-cta";
    fichaCta.textContent = "Clique para ver a ficha completa";

    fichaCorpo.appendChild(fichaTitulo);
    fichaCorpo.appendChild(fichaMeta);
    fichaCorpo.appendChild(fichaTag);
    fichaCorpo.appendChild(fichaDesc);
    fichaCorpo.appendChild(fichaPreco);
    fichaCorpo.appendChild(fichaCta);
    ficha.appendChild(fichaCapa);
    ficha.appendChild(fichaCorpo);

    var volume = document.createElement("div");
    volume.className = "livro__volume";

    var cubo = document.createElement("div");
    cubo.className = "livro__cubo";

    var lombada = document.createElement("div");
    lombada.className = "livro__lombada";
    lombada.setAttribute("aria-hidden", "true");

    var lombadaTitulo = document.createElement("span");
    lombadaTitulo.className = "livro__lombada-titulo";
    lombadaTitulo.textContent = dados.nome;

    var lombadaAutor = document.createElement("span");
    lombadaAutor.className = "livro__lombada-autor";
    lombadaAutor.textContent = dados.autor.split(" ").pop();

    lombada.appendChild(lombadaTitulo);
    lombada.appendChild(lombadaAutor);

    var frente = document.createElement("div");
    frente.className = "livro__frente";

    var capa = document.createElement("img");
    capa.className = "livro__capa";
    capa.alt = "Capa — " + dados.nome;
    capa.width = 140;
    capa.height = 205;
    capa.loading = "lazy";
    capa.decoding = "async";

    iniciarCapaMultiorigem(capa, montarFilaCapas(produtoCompleto), optsCapa);

    frente.appendChild(capa);
    cubo.appendChild(lombada);
    cubo.appendChild(frente);
    volume.appendChild(cubo);
    artigo.appendChild(ficha);
    artigo.appendChild(volume);

    vincularAbrirDetalhe(artigo, dados);

    artigo.addEventListener("mouseenter", function () {
      ativarFichaLivro(artigo);
    });
    artigo.addEventListener("mouseleave", function () {
      desativarFichaLivro(artigo);
    });
    artigo.addEventListener("focusin", function () {
      ativarFichaLivro(artigo);
    });
    artigo.addEventListener("focusout", function (ev) {
      if (!artigo.contains(ev.relatedTarget)) {
        desativarFichaLivro(artigo);
      }
    });

    return artigo;
  }

  function montarPrateleira(livros, nomeGenero, indiceBase, indicePrateleira) {
    var prateleira = document.createElement("div");
    prateleira.className = "estante__prateleira";
    prateleira.setAttribute("role", "listitem");
    prateleira.style.animationDelay = String((indicePrateleira || 0) * 120) + "ms";

    var rotulo = document.createElement("div");
    rotulo.className = "estante__rotulo";

    var rotuloNome = document.createElement("span");
    rotuloNome.className = "estante__rotulo-nome";
    rotuloNome.textContent = nomeGenero;

    var rotuloQtd = document.createElement("span");
    rotuloQtd.className = "estante__rotulo-qtd";
    rotuloQtd.textContent = livros.length + " obra" + (livros.length === 1 ? "" : "s");

    rotulo.appendChild(rotuloNome);
    rotulo.appendChild(rotuloQtd);

    var unidade = document.createElement("div");
    unidade.className = "estante__unidade";

    var parede = document.createElement("div");
    parede.className = "estante__parede";
    parede.setAttribute("aria-hidden", "true");

    var suporte = document.createElement("div");
    suporte.className = "estante__suporte";

    var lateralEsq = document.createElement("div");
    lateralEsq.className = "estante__lateral estante__lateral--esq";
    lateralEsq.setAttribute("aria-hidden", "true");

    var fileiraScroll = document.createElement("div");
    fileiraScroll.className = "estante__fileira-scroll";

    var fileira = document.createElement("div");
    fileira.className = "estante__fileira";

    livros.forEach(function (item, i) {
      fileira.appendChild(montarLivro(item, indiceBase + i));
    });

    fileiraScroll.appendChild(fileira);
    requestAnimationFrame(function () {
      ajustarFileiraScroll(fileiraScroll);
    });

    var lateralDir = document.createElement("div");
    lateralDir.className = "estante__lateral estante__lateral--dir";
    lateralDir.setAttribute("aria-hidden", "true");

    var tabua = document.createElement("div");
    tabua.className = "estante__tabua";
    tabua.setAttribute("aria-hidden", "true");

    var sombraChao = document.createElement("div");
    sombraChao.className = "estante__sombra-chao";
    sombraChao.setAttribute("aria-hidden", "true");

    suporte.appendChild(lateralEsq);
    suporte.appendChild(fileiraScroll);
    suporte.appendChild(lateralDir);
    unidade.appendChild(parede);
    unidade.appendChild(suporte);
    unidade.appendChild(tabua);
    unidade.appendChild(sombraChao);
    prateleira.appendChild(rotulo);
    prateleira.appendChild(unidade);

    return prateleira;
  }

  function vincularAbrirDetalhe(artigo, dados) {
    artigo.addEventListener("click", function () {
      abrirDetalhe(dados.id, artigo);
    });
    artigo.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        abrirDetalhe(dados.id, artigo);
      }
    });
  }

  function montarCartaoGrade(dados, indice) {
    var produtoCompleto = obterProdutoPorId(dados.id) || dados;
    var precoFormatado = dados.precoFormatado || formatarPreco(produtoCompleto.preco);

    var artigo = document.createElement("article");
    artigo.className = "cartao-capa";
    artigo.setAttribute("data-id", String(dados.id));
    artigo.setAttribute("role", "button");
    artigo.setAttribute("tabindex", "0");
    artigo.setAttribute(
      "aria-label",
      dados.nome + ", por " + dados.autor + ". Clique para ver a ficha completa."
    );
    artigo.setAttribute("aria-expanded", "false");
    artigo.style.animationDelay = String(indice * 32) + "ms";

    var optsCapa = opcoesCapaComPaleta(artigo, produtoCompleto);

    var capaWrap = document.createElement("div");
    capaWrap.className = "cartao-capa__capa-wrap";

    var img = document.createElement("img");
    img.className = "cartao-capa__img";
    img.alt = "Capa — " + dados.nome;
    img.width = 140;
    img.height = 205;
    img.loading = "lazy";
    img.decoding = "async";
    iniciarCapaMultiorigem(img, montarFilaCapas(produtoCompleto), optsCapa);

    capaWrap.appendChild(img);

    var corpo = document.createElement("div");
    corpo.className = "cartao-capa__corpo";

    var titulo = document.createElement("h3");
    titulo.className = "cartao-capa__titulo";
    titulo.textContent = dados.nome;

    var autor = document.createElement("p");
    autor.className = "cartao-capa__autor";
    autor.textContent = dados.autor;

    var preco = document.createElement("p");
    preco.className = "cartao-capa__preco";
    preco.textContent = precoFormatado;

    corpo.appendChild(titulo);
    corpo.appendChild(autor);
    corpo.appendChild(preco);
    artigo.appendChild(capaWrap);
    artigo.appendChild(corpo);

    vincularAbrirDetalhe(artigo, dados);
    return artigo;
  }

  function montarSecaoGrade(livros, nomeGenero, indiceBase, indiceSecao) {
    var secao = document.createElement("section");
    secao.className = "grade-genero";
    secao.setAttribute("role", "listitem");
    secao.style.animationDelay = String((indiceSecao || 0) * 100) + "ms";

    var cab = document.createElement("div");
    cab.className = "grade-genero__cabecalho";

    var nome = document.createElement("span");
    nome.className = "grade-genero__nome";
    nome.textContent = nomeGenero;

    var qtd = document.createElement("span");
    qtd.className = "grade-genero__qtd";
    qtd.textContent = livros.length + " obra" + (livros.length === 1 ? "" : "s");

    cab.appendChild(nome);
    cab.appendChild(qtd);

    var grid = document.createElement("div");
    grid.className = "grade-genero__itens";
    grid.setAttribute("role", "list");

    livros.forEach(function (item, i) {
      grid.appendChild(montarCartaoGrade(item, indiceBase + i));
    });

    secao.appendChild(cab);
    secao.appendChild(grid);
    return secao;
  }

  function atualizarBotaoLimpar() {
    var temTexto = termoBusca.trim().length > 0;
    var temCategoria = categoriaFiltro.length > 0;
    var catalogoVazio = secaoCatalogo.classList.contains("catalogo--sem-resultados");
    var mostrar = temTexto || temCategoria || (catalogoVazio && produtos.length > 0);
    if (mostrar) {
      btnLimpar.classList.remove("busca__limpar--oculto");
    } else {
      btnLimpar.classList.add("busca__limpar--oculto");
    }
  }

  var resizeEstanteTimer = null;

  function lerEspessuraBasePx(el) {
    var base = parseFloat(el.dataset.espessuraBase, 10);
    if (!isNaN(base) && base > 0) return base;
    var css = parseFloat(getComputedStyle(el).getPropertyValue("--espessura"), 10);
    return !isNaN(css) && css > 0 ? css : 18;
  }

  function aplicarLarguraLombada(el, larguraPx) {
    var w = Math.round(larguraPx);
    el.style.flex = "none";
    el.style.width = w + "px";
    el.style.minWidth = "";
    el.style.setProperty("--espessura", w + "px");
    el.classList.toggle("livro--lombada-larga", w >= 30);
  }

  function ajustarFileiraScroll(fileiraScroll) {
    var fileira = fileiraScroll.querySelector(".estante__fileira");
    if (!fileira) return;

    var containerW = fileiraScroll.clientWidth;
    var padL = parseFloat(getComputedStyle(fileiraScroll).paddingLeft) || 0;
    var padR = parseFloat(getComputedStyle(fileiraScroll).paddingRight) || 0;
    containerW = Math.max(0, containerW - padL - padR);
    if (containerW < 1) return;

    var livros = Array.prototype.slice.call(fileira.querySelectorAll(".livro"));
    if (!livros.length) return;

    var gap = 2;
    var bases = livros.map(lerEspessuraBasePx);
    var somaBase = bases.reduce(function (acc, n) {
      return acc + n;
    }, 0);
    var natural = somaBase + gap * Math.max(0, livros.length - 1);
    var poucosLivros = livros.length <= 10 && natural < containerW * 0.5;

    fileira.classList.remove("estante__fileira--preenchida");
    fileira.classList.toggle("estante__fileira--espalhada", poucosLivros);
    fileira.style.display = "";
    fileira.style.gridTemplateColumns = "";
    fileira.style.gap = "";

    livros.forEach(function (el, i) {
      aplicarLarguraLombada(el, bases[i]);
    });

    if (poucosLivros) {
      fileira.style.width = "100%";
      return;
    }

    if (natural >= containerW - 1) {
      fileira.style.width = natural + "px";
      return;
    }

    var disponivel = containerW - gap * Math.max(0, livros.length - 1);
    var fator = disponivel / somaBase;
    var maxLombada = 44;

    livros.forEach(function (el, i) {
      aplicarLarguraLombada(el, Math.min(Math.max(bases[i], Math.round(bases[i] * fator)), maxLombada));
    });
    fileira.style.width = "100%";
  }

  function ajustarPreenchimentoEstantes() {
    if (modoVisualizacao !== "estante" || !listaProdutos) return;
    listaProdutos.querySelectorAll(".estante__fileira-scroll").forEach(ajustarFileiraScroll);
  }

  function renderizar() {
    var filtrados = obterFiltrados();
    var semResultados = filtrados.length === 0 && produtos.length > 0;

    listaProdutos.replaceChildren();
    listaProdutos.className = modoVisualizacao === "grade" ? "catalogo-grade" : "estante";
    listaProdutos.setAttribute(
      "aria-label",
      modoVisualizacao === "grade"
        ? "Grade de capas do acervo por gênero"
        : "Estantes do acervo com livros organizados por prateleira"
    );
    secaoCatalogo.classList.toggle("catalogo--modo-grade", modoVisualizacao === "grade");

    if (semResultados) {
      secaoCatalogo.classList.add("catalogo--sem-resultados");
      mensagemVazio.classList.remove("catalogo__vazio--oculto");
    } else {
      secaoCatalogo.classList.remove("catalogo--sem-resultados");
      mensagemVazio.classList.add("catalogo__vazio--oculto");
    }

    var paraExibir = filtrados.map(function (p) {
      return {
        id: p.id,
        isbn: p.isbn,
        isbnAlt: p.isbnAlt,
        imagem: p.imagem,
        nome: p.nome,
        autor: p.autor,
        categoria: p.categoria,
        paginas: p.paginas,
        descricao: p.descricao,
        preco: p.preco,
        precoFormatado: formatarPreco(p.preco),
      };
    });

    var grupos = agruparPorGenero(paraExibir);
    var indice = 0;
    var indicePrateleira = 0;
    generosNaOrdem(grupos).forEach(function (genero) {
      if (modoVisualizacao === "grade") {
        listaProdutos.appendChild(montarSecaoGrade(grupos[genero], genero, indice, indicePrateleira));
      } else {
        listaProdutos.appendChild(montarPrateleira(grupos[genero], genero, indice, indicePrateleira));
      }
      indice += grupos[genero].length;
      indicePrateleira += 1;
    });

    if (catalogoStats) {
      var n = filtrados.length;
      var total = produtos.length;
      if (n === total) {
        catalogoStats.textContent = "Mostrando todas as " + total + " obras";
      } else {
        catalogoStats.textContent =
          n + " obra" + (n === 1 ? "" : "s") + " encontrada" + (n === 1 ? "" : "s") + " · " + total + " no acervo";
      }
    }
    montarChipsCategoria();
    atualizarResumoFiltros(filtrados.length);

    atualizarAriaExpandedCartoes();
    atualizarBotaoLimpar();

    if (modoVisualizacao === "estante") {
      requestAnimationFrame(function () {
        requestAnimationFrame(ajustarPreenchimentoEstantes);
      });
      setTimeout(ajustarPreenchimentoEstantes, 120);
      setTimeout(ajustarPreenchimentoEstantes, 400);
    }
  }

  function limparFiltro() {
    termoBusca = "";
    categoriaFiltro = "";
    inputFiltro.value = "";
    renderizar();
    inputFiltro.focus();
  }

  if (modalFechar) {
    modalFechar.addEventListener("click", fecharDetalhe);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", fecharDetalhe);
  }
  if (modalLivro) {
    modalLivro.addEventListener("keydown", prenderFocoModal);
  }

  inputFiltro.addEventListener("input", function () {
    termoBusca = inputFiltro.value;
    renderizar();
  });

  btnLimpar.addEventListener("click", function () {
    limparFiltro();
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      if (modalAberto) {
        ev.preventDefault();
        fecharDetalhe();
        return;
      }
      if (termoBusca.trim().length > 0 || categoriaFiltro.length > 0) {
        limparFiltro();
      }
    }
  });

  window.addEventListener(
    "scroll",
    function () {
      if (livroFichaAtivo) {
        posicionarFichaFlutuante(livroFichaAtivo);
      }
    },
    true
  );
  window.addEventListener("resize", function () {
    if (livroFichaAtivo) {
      posicionarFichaFlutuante(livroFichaAtivo);
    }
    clearTimeout(resizeEstanteTimer);
    resizeEstanteTimer = setTimeout(ajustarPreenchimentoEstantes, 100);
  });

  if (typeof ResizeObserver !== "undefined" && listaProdutos) {
    var obsEstante = new ResizeObserver(function () {
      clearTimeout(resizeEstanteTimer);
      resizeEstanteTimer = setTimeout(ajustarPreenchimentoEstantes, 80);
    });
    obsEstante.observe(listaProdutos);
  }

  var modosEl = document.querySelector(".catalogo__modos");
  if (modosEl) {
    modosEl.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".catalogo__modo");
      if (!btn) {
        return;
      }
      ev.preventDefault();
      ev.stopPropagation();
      definirModoVisualizacao(btn.getAttribute("data-modo"));
    });
  }

  atualizarBotoesModo();
  inicializarHero();
  renderizar();

  var btnMenuSite = document.getElementById("btn-menu-site");
  var navSite = document.getElementById("nav-site");
  var linksNavSite = document.querySelectorAll(".site-nav__link[data-nav]");

  function fecharMenuSite() {
    if (!navSite || !btnMenuSite) {
      return;
    }
    navSite.classList.remove("site-nav--aberto");
    btnMenuSite.setAttribute("aria-expanded", "false");
    btnMenuSite.setAttribute("aria-label", "Abrir menu de navegação");
    document.body.classList.remove("menu-site-aberto");
  }

  function abrirMenuSite() {
    if (!navSite || !btnMenuSite) {
      return;
    }
    navSite.classList.add("site-nav--aberto");
    btnMenuSite.setAttribute("aria-expanded", "true");
    btnMenuSite.setAttribute("aria-label", "Fechar menu de navegação");
    document.body.classList.add("menu-site-aberto");
  }

  if (btnMenuSite && navSite) {
    btnMenuSite.addEventListener("click", function () {
      if (navSite.classList.contains("site-nav--aberto")) {
        fecharMenuSite();
      } else {
        abrirMenuSite();
      }
    });
  }

  linksNavSite.forEach(function (link) {
    link.addEventListener("click", function () {
      linksNavSite.forEach(function (l) {
        l.classList.remove("site-nav__link--ativo");
      });
      link.classList.add("site-nav__link--ativo");
      fecharMenuSite();
    });
  });

  document.querySelectorAll('.site-header__cta, .hero__btn, .rodape__nav a[href^="#"]').forEach(function (el) {
    el.addEventListener("click", function () {
      fecharMenuSite();
    });
  });
})();

