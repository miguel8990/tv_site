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
    imagem: "src/bem-te-vi.png",
    ingredientes: ["Pão", "Hambúrguer", "Presunto", "Muçarela", "Ovo", "Bacon", "Molho da casa", "Milho", "Alface", "Tomate"],
    preco: 30.00
  },
  {
    nome: "Kaldo-Kenga",
    imagem: "src/caldo-de-kenga.png",
    ingredientes: ["Caldo cremoso", "Frango desfiado", "Tempero caseiro"],
    preco: 15.00
  },
  {
    nome: "Falcão",
    imagem: "src/falcao.png",
    ingredientes: ["Pão", "Presunto", "Muçarela", "Ovo", "Requeijão", "Bacon", "Milho", "Alface", "Molho da casa", "Tomate", "Opções: Frango, Lombo ou Filé"],
    preco: 35.00
  },
  {
    nome: "Misto-Quente",
    imagem: "src/misto-quente.png",
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
 * Inicia o scroll contínuo do carrossel via requestAnimationFrame.
 * Usa delta de tempo real para ser independente do frame rate.
 *
 * Velocidade: 1 set completo de cards a cada 40 segundos.
 *
 * Reset pixel-perfect:
 * Em vez de usar scrollWidth/2 (impreciso por causa de padding
 * e gap), medimos o offsetLeft do 1º card do set2 duplicado.
 * Isso garante que o reset caia EXATAMENTE no pixel certo,
 * eliminando qualquer flicker ou salto visível.
 */
function iniciarCarrosselJS() {
  const trilha = document.getElementById("carrossel-trilha");
  const DURACAO_CICLO_MS = 40000; // 40 segundos por set
  const totalProdutos = produtos.length;

  let posicaoAtual = 0;
  let ultimoTimestamp = null;

  // Aguarda 2 frames para garantir que o layout está 100% calculado
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Pega todos os cards renderizados
      const cards = trilha.querySelectorAll(".card");

      // O 1º card do set2 está no índice = totalProdutos
      // Seu offsetLeft é a distância exata de 1 ciclo completo
      const distanciaCiclo = cards[totalProdutos].offsetLeft - cards[0].offsetLeft;

      // Velocidade em pixels por milissegundo
      const velocidade = distanciaCiclo / DURACAO_CICLO_MS;

      /**
       * Loop de animação contínuo via requestAnimationFrame.
       * @param {DOMHighResTimeStamp} timestamp
       */
      function animar(timestamp) {
        if (ultimoTimestamp === null) {
          ultimoTimestamp = timestamp;
          requestAnimationFrame(animar);
          return;
        }

        const delta = timestamp - ultimoTimestamp;
        ultimoTimestamp = timestamp;

        // Avança proporcionalmente ao tempo real decorrido
        posicaoAtual -= velocidade * delta;

        // Reset pixel-perfect: quando atingimos a distância de 1 ciclo,
        // somamos de volta. Visualmente imperceptível pois set2 = set1.
        if (Math.abs(posicaoAtual) >= distanciaCiclo) {
          posicaoAtual += distanciaCiclo;
        }

        trilha.style.transform = `translateX(${posicaoAtual}px)`;
        requestAnimationFrame(animar);
      }

      requestAnimationFrame(animar);
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
 * Cada frame fica visível por 3 segundos, com transição
 * suave de 1.5s entre eles.
 */
function iniciarAnimacaoFundo() {
  const frames = document.querySelectorAll(".junina-bg__frame");
  if (frames.length === 0) return;

  let frameAtual = 0;
  const totalFrames = frames.length;
  const INTERVALO = 3000; // 3 segundos por frame

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
 *  6. INICIALIZAÇÃO
 *  Tudo começa quando o DOM estiver pronto.
 * ──────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Monta os cards no DOM (sem animação CSS)
  montarCarrossel();

  // Inicia o scroll contínuo via requestAnimationFrame (sem flicker)
  iniciarCarrosselJS();

  // Dispara a animação da logo imediatamente na carga
  animarLogo();

  // Re-dispara a animação da logo a cada 60 segundos
  setInterval(animarLogo, 60000);

  // Inicia a animação do fundo junino (se o tema estiver ativo)
  if (document.body.classList.contains("tema-junino")) {
    iniciarAnimacaoFundo();
  }
});
