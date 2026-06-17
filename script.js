/**
 * ============================================================
 *  CEGONHA LANCHES — Menu Board Digital
 *  Arquivo: script.js
 *
 *  Responsável por:
 *  1. Definir a lista de produtos (array de objetos)
 *  2. Renderizar os cards dinamicamente no carrossel
 *  3. Duplicar os cards para garantir o loop contínuo
 *  4. Disparar a animação da logo a cada 60 segundos
 *  5. Animar os frames do fundo junino (crossfade loop)
 * ============================================================
 */

/* ────────────────────────────────────────────────────────────
 *  1. DADOS DOS PRODUTOS
 *  Cada objeto segue rigorosamente a estrutura exigida:
 *  { nome, imagem, ingredientes[], preco }
 * ──────────────────────────────────────────────────────────── */
const produtos = [
  {
    nome: "Bem-te-vi",
    imagem: "src/bem-te-vi.webp",
    ingredientes: ["Pão", "Hambúrguer", "Presunto", "Muçarela", "Ovo", "Bacon", "Molho da casa", "Milho", "Alface", "Tomate"],
    preco: 30.00
  },
  {
    nome: "Kaldo-Kenga",
    imagem: "src/caldo-de-kenga.webp",
    ingredientes: ["Caldo cremoso", "Frango desfiado", "Tempero caseiro"],
    preco: 15.00
  },
  {
    nome: "Falcão",
    imagem: "src/falcao.webp",
    ingredientes: ["Pão", "Presunto", "Muçarela", "Ovo", "Requeijão", "Bacon", "Milho", "Alface", "Molho da casa", "Tomate", "Opções: Frango, Lombo ou Filé"],
    preco: 35.00
  },
  {
    nome: "Misto-Quente",
    imagem: "src/misto-quente.webp",
    ingredientes: ["Pão francês", "Presunto", "Muçarela"],
    preco: 15.00
  }
];


/* ────────────────────────────────────────────────────────────
 *  2. RENDERIZAÇÃO DINÂMICA DOS CARDS
 *  Lê o array 'produtos' e gera HTML para cada card.
 * ──────────────────────────────────────────────────────────── */

/**
 * Formata um número como preço em Reais (R$).
 * Ex: 19.9 → "R$ 19,90"
 * @param {number} valor - O preço numérico
 * @returns {string} Preço formatado
 */
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/**
 * Gera o HTML de um card de produto.
 * Layout horizontal: imagem à esquerda, textos à direita.
 * Ingredientes são exibidos em lista vertical (<ul>).
 * @param {Object} produto - Objeto com { nome, imagem, ingredientes, preco }
 * @returns {string} String HTML do card
 */
function criarCardHTML(produto) {
  // Monta a lista de ingredientes como itens <li> verticais
  const listaIngredientes = produto.ingredientes
    .map(ing => `<li class="card__ingrediente-item">${ing}</li>`)
    .join("");

  return `
    <article class="card" aria-label="Produto: ${produto.nome}">
      <!-- Imagem do produto — aspect-ratio 1:1 forçado via CSS -->
      <div class="card__img-wrapper">
        <img
          src="${produto.imagem}"
          alt="${produto.nome}"
          class="card__img"
          loading="eager"
          decoding="sync"
        >
      </div>

      <!-- Bloco de informações -->
      <div class="card__info">
        <h2 class="card__nome">${produto.nome}</h2>
        <ul class="card__ingredientes">
          ${listaIngredientes}
        </ul>
        <p class="card__preco">${formatarPreco(produto.preco)}</p>
      </div>
    </article>
  `;
}


/* ────────────────────────────────────────────────────────────
 *  3. MONTAGEM DO CARROSSEL COM LOOP INFINITO (SEM FLICKER)
 *
 *  Problema do CSS animation infinite:
 *  Ao resetar de translateX(-50%) para translateX(0), o
 *  navegador renderiza 1 frame na posição 0, causando um
 *  "flicker" visível. A solução é controlar o movimento
 *  via requestAnimationFrame com cálculos baseados em tempo
 *  real. Quando a posição atinge metade da trilha (set
 *  duplicado), reseta instantaneamente — como o conteúdo
 *  é idêntico, o reset é imperceptível.
 * ──────────────────────────────────────────────────────────── */

/**
 * Injeta os cards na trilha do carrossel.
 * Duplica o array completo para permitir loop visual.
 */
function montarCarrossel() {
  const trilha = document.getElementById("carrossel-trilha");

  // Gera os cards para todos os produtos (set original)
  const cardsHTML = produtos.map(criarCardHTML).join("");

  // Duplica os cards para criar o efeito de loop contínuo.
  trilha.innerHTML = cardsHTML + cardsHTML;
}

/**
 * Inicia o scroll contínuo do carrossel injetando animação CSS dinamicamente.
 * Otimizado para Smart TV: Remove a carga de cálculo por frame do JS (requestAnimationFrame)
 * e delega tudo para a GPU usando transform: translate3d.
 *
 * Reset pixel-perfect:
 * Medimos o offsetLeft do 1º card do set2 duplicado para gerar um
 * keyframes exato. A velocidade foi reduzida em 30% (52s) para dar folga.
 */
function iniciarCarrosselJS() {
  const trilha = document.getElementById("carrossel-trilha");
  const totalProdutos = produtos.length;

  // Aguarda 2 frames para garantir que o layout está 100% calculado antes de medir
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Pega todos os cards renderizados
      const cards = trilha.querySelectorAll(".card");

      // O 1º card do set2 está no índice = totalProdutos
      // Seu offsetLeft é a distância exata de 1 ciclo completo
      const distanciaCiclo = cards[totalProdutos].offsetLeft - cards[0].offsetLeft;

      // Injeta uma tag <style> dinamicamente para forçar aceleração de hardware (GPU)
      // O uso do translate3d() previne repinturas de CPU engasgarem a TV
      const styleSheet = document.createElement("style");
      styleSheet.innerHTML = `
        @keyframes scrollInfinitoTV {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-${distanciaCiclo}px, 0, 0);
          }
        }
      `;
      document.head.appendChild(styleSheet);

      // Aplica a animação com velocidade reduzida (52s = 40s + 30%)
      trilha.style.animation = "scrollInfinitoTV 52s linear infinite";
    });
  });
}


/* ────────────────────────────────────────────────────────────
 *  4. ANIMAÇÃO DA LOGO — 360° Spin + Grow Up + Glow Up
 *  Disparada via JS (classe .logo--animando) a cada 60s.
 *  Sequência: giro 360° → escala crescente + brilho intenso → volta ao normal
 * ──────────────────────────────────────────────────────────── */

/**
 * Dispara a animação de destaque na logo.
 * A classe 'logo--animando' ativa o @keyframes definido no CSS.
 */
function animarLogo() {
  const logo = document.getElementById("logo");
  if (!logo) return;

  // Adiciona a classe que dispara a animação
  logo.classList.add("logo--animando");

  // Remove a classe ao final da animação para permitir re-trigger
  logo.addEventListener("animationend", () => {
    logo.classList.remove("logo--animando");
  }, { once: true });
}


/* ────────────────────────────────────────────────────────────
 *  5. ANIMAÇÃO DO FUNDO JUNINO (CROSSFADE DE FRAMES)
 *  Alterna entre 5 frames com transição suave (crossfade)
 *  criando uma mini-animação tipo "gif" em loop.
 *  Só roda se a classe .tema-junino estiver ativa.
 * ──────────────────────────────────────────────────────────── */

/**
 * Inicia o loop de crossfade entre os 5 frames do fundo.
 * Retardamos as transições de fundo para aliviar a carga (4500ms).
 */
function iniciarAnimacaoFundo() {
  const frames = document.querySelectorAll(".junina-bg__frame");
  if (frames.length === 0) return;

  let frameAtual = 0;
  const totalFrames = frames.length;
  const INTERVALO = 4500; // 4.5 segundos por frame (retardado em 50%)

  setInterval(() => {
    // Remove classe ativa do frame atual
    frames[frameAtual].classList.remove("junina-bg__frame--active");

    // Avança para o próximo frame (volta ao 0 após o último)
    frameAtual = (frameAtual + 1) % totalFrames;

    // Ativa o novo frame
    frames[frameAtual].classList.add("junina-bg__frame--active");
  }, INTERVALO);
}


/* ────────────────────────────────────────────────────────────
 *  6. TELA DE INICIALIZAÇÃO + FULLSCREEN API
 *  Ao clicar no botão "Iniciar Site", o sistema:
 *  1. Detecta o navegador e chama a API de fullscreen correta
 *  2. Esconde a splash screen com fade
 *  3. Revela o conteúdo do site
 *  4. Inicializa carrossel, logo e fundo junino
 * ──────────────────────────────────────────────────────────── */

/**
 * Solicita tela cheia ao navegador usando a API correta.
 * Faz ciclos de if/else para cobrir:
 *   - Chrome, Edge (Chromium), Opera → requestFullscreen()
 *   - Firefox → mozRequestFullScreen()
 *   - Safari (desktop/iOS) → webkitRequestFullscreen()
 *   - IE11 / Edge legado → msRequestFullscreen()
 *
 * @returns {Promise|undefined} Promise de fullscreen ou undefined se não suportado
 */
function ativarTelaCheia() {
  const elem = document.documentElement; // <html> — fullscreen na página toda

  if (elem.requestFullscreen) {
    // Chrome 15+, Edge 79+, Firefox 64+, Opera 15+, Safari 16.4+
    return elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    // Safari 5.1+, Chrome antigo, iOS Safari
    return elem.webkitRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    // Firefox 10+ (prefixo moz, note o S maiúsculo)
    return elem.mozRequestFullScreen();
  } else if (elem.msRequestFullscreen) {
    // IE 11, Edge 12-18 (legado)
    return elem.msRequestFullscreen();
  } else {
    // Navegador não suporta fullscreen — continua sem
    console.warn("Fullscreen API não suportada neste navegador.");
    return Promise.resolve();
  }
}

/**
 * Função chamada pelo onclick do botão "Iniciar Site".
 * Ativa fullscreen, esconde a splash e inicializa o menu board.
 */
function iniciarSite() {
  // 1. Tenta ativar tela cheia (pode falhar se o navegador bloquear)
  try {
    ativarTelaCheia();
  } catch (erro) {
    console.warn("Não foi possível ativar tela cheia:", erro);
  }

  // 2. Esconde a splash screen com fade (transição CSS de 0.5s)
  const splash = document.getElementById("splash-screen");
  splash.classList.add("splash--oculta");

  // 3. Revela o conteúdo do site
  const conteudo = document.getElementById("site-conteudo");
  conteudo.classList.remove("site-conteudo--oculto");

  // 4. Inicializa todo o sistema do menu board
  // (Aguarda 1 frame para o DOM do conteúdo estar visível e renderizado)
  requestAnimationFrame(() => {
    // Monta os cards no DOM
    montarCarrossel();

    // Inicia o scroll contínuo (sem flicker)
    iniciarCarrosselJS();

    // Dispara a animação da logo
    animarLogo();

    // Re-dispara a animação da logo a cada 60 segundos
    setInterval(animarLogo, 60000);

    // Inicia a animação do fundo junino (se o tema estiver ativo)
    if (document.body.classList.contains("tema-junino")) {
      iniciarAnimacaoFundo();
    }
  });

  // 5. Remove a splash do DOM após a transição de fade terminar (500ms)
  setTimeout(() => {
    splash.remove();
  }, 600);
}


/* ────────────────────────────────────────────────────────────
 *  7. INICIALIZAÇÃO DO DOM
 *  No DOMContentLoaded, NÃO inicializa o site.
 *  Apenas aguarda o clique no botão "Iniciar Site".
 *  Todo o setup real acontece dentro de iniciarSite().
 * ──────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Nada a fazer aqui — o site só inicia após clicar o botão.
  // A função iniciarSite() cuida de tudo.
});

