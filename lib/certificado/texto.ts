/**
 * Texto do certificado: as regras de escrita do documento, isoladas do desenho.
 *
 * Existem aqui, e não espalhadas na tela, por dois motivos: são regras
 * editoriais que valem para qualquer versão do certificado, e são a parte que
 * dá para testar sem navegador.
 */

/**
 * Traços que precisam sair do texto visível: hífen comum, os traços de
 * software (‐ ‑ ‒ – — ―), o menos matemático e o hífen de largura total.
 */
const TRACOS = /[-‐‑‒–—―−﹘﹣－]/g

/** Traço usado como SEPARADOR: cercado de espaço. */
const TRACO_SEPARADOR = /\s+[-‐‑‒–—―−﹘﹣－]+\s+/g

/**
 * Tira todo traço do texto, sem deixar buraco.
 *
 * Dois casos, e eles pedem tratamento diferente:
 *
 * - traço SEPARADOR (com espaço dos dois lados) vira a pontuação passada em
 *   `separador`. Num título, "Parte 1 — A página existe" pede dois pontos;
 *   no meio de uma frase corrida, "…do Professor André Gomes — da interface
 *   básica ao PROCV" pede vírgula, porque dois pontos ali soariam como se
 *   fossem abrir uma lista.
 *
 * - traço DENTRO da palavra vira espaço: "PHP — Back-end Web" precisa virar
 *   "PHP: Back end Web", e não "PHP: Backend Web", porque juntar as duas
 *   metades inventaria uma grafia que ninguém escreveu.
 *
 * O que NÃO passa por aqui, de propósito: o código de validação (JB-XXXXXXXX)
 * e o endereço de conferência. Os dois são identificador, não texto editorial —
 * a mesma exceção que vale para classe de CSS e nome de pacote. Tirar o traço
 * do código quebraria a validação dos certificados já entregues, que têm o
 * código impresso no papel.
 */
export function semTraco(texto: string, separador = ': '): string {
  return texto
    .replace(TRACO_SEPARADOR, separador)
    .replace(TRACOS, ' ')
    // Espaço antes de pontuação e espaço dobrado, que a troca acima pode criar.
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Título de curso ou módulo, como sai impresso. */
export function tituloDoCertificado(titulo: string): string {
  return semTraco(titulo, ': ')
}

/** Descrição do conteúdo, em frase corrida. */
export function descricaoDoCertificado(descricao: string | null): string {
  return descricao ? semTraco(descricao, ', ') : ''
}

/**
 * Separa o pronome de tratamento do nome, para a linha de assinatura.
 *
 * O banco guarda "Professor André Gomes" num campo só, e a assinatura precisa
 * do nome numa linha e do cargo na outra. Sem pronome, o cargo cai para
 * "Responsável pelo curso", que é o que a pessoa é naquele documento.
 */
const PRONOMES = ['Professora', 'Professor', 'Profa.', 'Prof.', 'Profa', 'Prof']

export function nomeECargo(
  completo: string | null,
  cargoPadrao = 'Responsável pelo curso'
): { nome: string; cargo: string } {
  const limpo = semTraco(completo ?? '', ' ')
  if (!limpo) return { nome: 'E.E. Dr. João Beraldo', cargo: 'Instituição' }

  for (const pronome of PRONOMES) {
    if (limpo.toLowerCase().startsWith(pronome.toLowerCase() + ' ')) {
      const nome = limpo.slice(pronome.length).trim()
      // "Prof." e "Profa." viram o cargo por extenso: num documento formal a
      // abreviação embaixo da assinatura fica pobre.
      const cargo = pronome.toLowerCase().startsWith('professora') || pronome.toLowerCase().startsWith('profa')
        ? 'Professora'
        : 'Professor'
      return { nome, cargo }
    }
  }
  return { nome: limpo, cargo: cargoPadrao }
}

const UNIDADES = [
  'zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
  'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove',
]
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta']

/** Número por extenso no feminino, que é o que "horas" e "minutos" pedem. */
function porExtenso(n: number): string {
  if (n < 20) return UNIDADES[n]
  const d = Math.floor(n / 10)
  const u = n % 10
  if (d < DEZENAS.length) return u === 0 ? DEZENAS[d] : `${DEZENAS[d]} e ${UNIDADES[u]}`
  return String(n)
}

/**
 * A carga horária como ela é dita num documento.
 *
 * Sai por extenso porque é assim que se escreve num certificado, e sai do
 * valor em MINUTOS que a plataforma guarda: os cursos daqui têm de quinze
 * minutos a poucas horas, e arredondar tudo para hora inteira faria um curso
 * de trinta minutos virar "uma hora" no documento.
 */
export function cargaPorExtenso(minutos: number): string {
  if (!Number.isFinite(minutos) || minutos <= 0) return ''
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60

  const parteHoras = horas > 0 ? `${porExtenso(horas)} ${horas === 1 ? 'hora' : 'horas'}` : ''
  const parteMinutos = resto > 0 ? `${porExtenso(resto)} ${resto === 1 ? 'minuto' : 'minutos'}` : ''

  if (parteHoras && parteMinutos) return `${parteHoras} e ${parteMinutos}`
  return parteHoras || parteMinutos
}
