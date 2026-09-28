/**
 * Tipos, rotulos e helpers puros da aba Projetos. Sem Prisma: este arquivo
 * entra no bundle do navegador (formularios do aluno e do professor), e
 * lib/db/projetos-turma.ts o reexporta para o lado do servidor.
 */

export const STATUS_ENVIO = ['enviado', 'em_andamento', 'ajustar', 'concluido'] as const
export type StatusEnvio = (typeof STATUS_ENVIO)[number]

export const ROTULO_STATUS: Record<StatusEnvio, string> = {
  enviado: 'Enviado, esperando o professor',
  em_andamento: 'Em andamento',
  ajustar: 'Precisa ajustar',
  concluido: 'Concluído',
}

/** "2° Ano" -> "2-ano". Nome de pasta na URL; o inverso e `pastaPeloSlug`. */
export function slugDaSerie(serie: string): string {
  return serie
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[°º]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Uma linha do cronograma. `inicio`/`fim` em YYYY-MM-DD ou null quando o
 * professor ainda nao marcou a data (o PDF do 2° ano veio com "___/___").
 */
export interface Etapa {
  titulo: string
  foco: string
  entrega: string
  inicio: string | null
  fim: string | null
  aviso: string | null
}

/** Um criterio de avaliacao. `peso` inteiro >= 1; a nota sugerida e ponderada. */
export interface Criterio {
  titulo: string
  descricao: string
  peso: number
}

/** Marca do professor em cada criterio: 0 falta, 1 parcial, 2 ok. Chave = indice do criterio. */
export type Marca = 0 | 1 | 2
export type Marcas = Record<string, Marca>

export const ROTULO_MARCA: Record<Marca, string> = { 0: 'Falta', 1: 'Parcial', 2: 'OK' }

/** Nota 0-10 a partir das marcas: soma(peso * marca/2) / soma(peso) * 10. Null sem criterio marcado. */
export function notaSugerida(criterios: Criterio[], marcas: Marcas): number | null {
  let pontos = 0
  let total = 0
  criterios.forEach((c, i) => {
    const m = marcas[String(i)]
    if (m === undefined) return
    total += c.peso
    pontos += c.peso * (m / 2)
  })
  if (total === 0) return null
  return Math.round((pontos / total) * 100) / 10
}

/** "2026-10-07" -> "07/10". */
export function dataCurta(iso: string | null): string {
  if (!iso) return ''
  const [a, m, d] = iso.split('-')
  return a && m && d ? `${d}/${m}` : iso
}

/** "07/10 a 13/10", "a partir de 07/10", "até 13/10" ou "" quando sem datas. */
export function periodo(e: Pick<Etapa, 'inicio' | 'fim'>): string {
  if (e.inicio && e.fim) return `${dataCurta(e.inicio)} a ${dataCurta(e.fim)}`
  if (e.inicio) return `a partir de ${dataCurta(e.inicio)}`
  if (e.fim) return `até ${dataCurta(e.fim)}`
  return ''
}

/** Indice da etapa que contem a data de hoje (YYYY-MM-DD), ou -1. */
export function etapaDeHoje(cronograma: Etapa[], hoje: string): number {
  return cronograma.findIndex(e => e.inicio && e.fim && e.inicio <= hoje && hoje <= e.fim)
}

export interface Pasta {
  id: string
  serie: string
  ordem: number
  totalTrabalhos: number
  totalPublicados: number
}

export interface Trabalho {
  id: string
  pastaId: string
  serie: string
  titulo: string
  resumo: string | null
  briefing: string | null
  arquivoUrl: string | null
  cronograma: Etapa[]
  criterios: Criterio[]
  pedeLinkGrupo: boolean
  publicado: boolean
  ordem: number
  criadoEm: string
  atualizadoEm: string
}

export interface Envio {
  id: string
  trabalhoId: string
  userId: string
  linkUrl: string
  repoUrl: string | null
  linkGrupo: string | null
  comentario: string | null
  status: StatusEnvio
  nota: number | null
  feedback: string | null
  etapa: number | null
  marcas: Marcas | null
  avaliadoEm: string | null
  enviadoEm: string
  atualizadoEm: string
}

export interface EnvioDaTurma extends Envio {
  aluno: { nome: string; matricula: string | null; turma: string | null }
}

export interface Avaliacao {
  id: string
  status: StatusEnvio
  nota: number | null
  feedback: string | null
  etapa: number | null
  marcas: Marcas | null
  criadoEm: string
  avaliador: string | null
}
