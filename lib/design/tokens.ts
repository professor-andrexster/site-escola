/**
 * Design system da E.E. Dr. João Beraldo — a fonte única dos valores.
 *
 * Existe porque o sistema tem DOIS temas convivendo, e a diferença entre eles
 * é a origem de quase todo erro visual daqui:
 *
 *  - PAINEL, claro: gestão, alunos, biblioteca, notícias. Fundo branco/cinza.
 *  - CURSOS, escuro: catálogo, módulos e o player de aula. Fundo #0F1419.
 *
 * O mesmo `text-gray-500` que funciona no painel some no player, e o mesmo
 * `text-white/50` que funciona no player some no painel. Por isso os tokens
 * abaixo são declarados POR TEMA, e não numa lista só.
 *
 * Os valores não são preferência: foram medidos. A auditoria em
 * `scripts/auditar-ui.mjs` recalcula o contraste de cada par e falha quando
 * algum cai abaixo do exigido — rode antes de entregar tela.
 */

// --------------------------------------------------------------- contraste
/**
 * WCAG 2.1 AA. Texto grande é 18px normal ou 14px em negrito.
 * Abaixo disso, 4,5:1. Não é meta: é o piso.
 */
export const CONTRASTE_MINIMO = { normal: 4.5, grande: 3.0 } as const

// ------------------------------------------------------------------- cor
export const COR = {
  /** Painel claro. Fundo branco ou gray-50. */
  painel: {
    /** Títulos e texto que precisa ser lido. 17,7:1 */
    texto: 'text-gray-900',
    /** Apoio, legenda, metadado. 4,83:1 — é o mais claro que passa. */
    apoio: 'text-gray-500',
    /** Marca. Botão, link, ícone de destaque. 11,6:1 */
    marca: 'text-escola-azul',
    /** Fundo de botão primário, com texto branco. */
    marcaFundo: 'bg-escola-azul',
    borda: 'border-gray-200',
    superficie: 'bg-white',
    fundo: 'bg-gray-50',
  },

  /** Tema dos cursos. Fundo curso-tinta (#0F1419). */
  curso: {
    /** Títulos. 18,5:1 */
    texto: 'text-white',
    /** Corpo de texto longo. 9,4:1 */
    corpo: 'text-white/70',
    /** Apoio, legenda. 5,33:1 */
    apoio: 'text-white/50',
    /** O mais claro admitido. 6,16:1 — abaixo disto some no projetor. */
    apoioFraco: 'text-white/55',
    /** Código e realce técnico. 8,64:1 */
    codigo: 'text-curso-ciano',
    marcaFundo: 'bg-curso-azul',
    borda: 'border-white/10',
    superficie: 'bg-white/5',
    fundo: 'bg-curso-tinta',
  },

  /** Estado. Valem nos dois temas, sempre com o par indicado. */
  estado: {
    sucesso: 'text-green-700 bg-green-50 border-green-200',
    alerta: 'text-amber-700 bg-amber-50 border-amber-200',
    erro: 'text-red-700 bg-red-50 border-red-200',
    neutro: 'text-gray-600 bg-gray-50 border-gray-200',
  },
} as const

/**
 * Proibidos. Foram medidos e reprovam no fundo em que apareciam.
 * A auditoria falha se voltarem.
 */
export const COR_PROIBIDA: Record<string, string> = {
  'text-gray-400': 'contraste 2,54 sobre branco. Use text-gray-500.',
  'text-white/30': 'contraste 2,70 sobre curso-tinta. Use text-white/50.',
  'text-white/40': 'contraste 3,83 sobre curso-tinta. Use text-white/55.',
}

// ------------------------------------------------------------- tipografia
/**
 * Escala. Razão 1,25 a partir de 16px, arredondada para o que o Tailwind já
 * oferece — inventar tamanho fora da escala é o que faz a tela parecer
 * montada aos pedaços.
 */
export const TEXTO = {
  /** 30px. Título de página. Um por tela. */
  titulo: 'text-3xl font-black',
  /** 24px. Título de seção. */
  seccao: 'text-2xl font-bold',
  /** 18px. Subtítulo, nome de card. */
  subtitulo: 'text-lg font-bold',
  /** 16px. Corpo padrão. */
  corpo: 'text-base',
  /** 14px. Corpo denso: tabela, lista, formulário. */
  corpoDenso: 'text-sm',
  /** 12px. Legenda e metadado. É o MENOR tamanho para texto que se lê. */
  legenda: 'text-xs',
  /** 10px, só em etiqueta de uma ou duas palavras, sempre com tracking. */
  etiqueta: 'text-[10px] uppercase tracking-widest',
} as const

/** Abaixo disto, texto corrido não é legível em celular. */
export const TAMANHO_MINIMO_PX = 12

/**
 * Famílias e seus papéis. Misturar quebra a identidade mais rápido que cor
 * errada, porque o olho reconhece a forma da letra antes do tom.
 */
export const FONTE = {
  /** Playfair. Título de página no painel. Nunca em corpo de texto. */
  display: 'font-playfair',
  /** Geom. Título no tema dos cursos. */
  displayCurso: 'font-geom',
  /** DM Sans, o padrão. Não precisa declarar. */
  corpo: '',
  /** JetBrains Mono. Código, código de certificado, número que se compara. */
  mono: 'font-jetbrains',
} as const

// -------------------------------------------------------------- espaço
/**
 * Base 4px. Só múltiplos — é o que faz blocos diferentes parecerem da mesma
 * família sem ninguém saber dizer por quê.
 */
export const ESPACO = {
  cardInterno: 'p-4 md:p-5',
  entreCards: 'gap-3',
  entreSeccoes: 'mb-8',
  paginaInterna: 'p-4 md:p-8',
  larguraLeitura: 'max-w-3xl',
  larguraPainel: 'max-w-5xl',
} as const

export const RAIO = { campo: 'rounded-lg', card: 'rounded-2xl', pilula: 'rounded-full' } as const

// ------------------------------------------------------------- interação
/**
 * Todo elemento clicável precisa de: estado hover, foco visível pelo teclado,
 * e área de toque de 44px em celular. Os três, não dois.
 */
export const INTERACAO = {
  transicao: 'transition-colors',
  focoPainel: 'focus:outline-none focus:ring-2 focus:ring-escola-azul/30',
  focoCurso: 'focus:outline-none focus:ring-2 focus:ring-curso-ciano/40',
  alvoToque: 'min-h-[44px]',
} as const
