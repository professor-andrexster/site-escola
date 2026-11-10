/**
 * Tipos, rotulos e helpers puros do podcast. Sem Prisma: componentes cliente
 * importam daqui.
 */

export const NOME_PODCAST = 'JB no Ar'

export const STATUS_AUTORIZACAO = ['pendente', 'enviada', 'aceita', 'revogada'] as const
export type StatusAutorizacao = (typeof STATUS_AUTORIZACAO)[number]

export const ROTULO_AUTORIZACAO: Record<StatusAutorizacao, string> = {
  pendente: 'Falta a autorização assinada',
  enviada: 'Assinada, esperando conferência',
  aceita: 'Liberado',
  revogada: 'Autorização revogada',
}

export const STATUS_EPISODIO = ['rascunho', 'revisao', 'ajustar', 'publicado', 'retirado'] as const
export type StatusEpisodio = (typeof STATUS_EPISODIO)[number]

export const ROTULO_EPISODIO: Record<StatusEpisodio, string> = {
  rascunho: 'Rascunho',
  revisao: 'Esperando o monitor',
  ajustar: 'Precisa de ajuste',
  publicado: 'No ar',
  retirado: 'Tirado do ar',
}

export const TIPOS_EPISODIO = ['entrevista', 'materia'] as const
export type TipoEpisodio = (typeof TIPOS_EPISODIO)[number]

/**
 * Quadro do podcast, como num programa de radio de verdade: o ouvinte sabe o
 * que esperar, e a equipe nao trava na folha em branco. Os quadros vivem na
 * tabela podcast_quadros e sao criados pelo painel (aba Quadros).
 */
export interface Quadro {
  id: string
  chave: string
  nome: string
  ideia: string | null
  ordem: number
  ativo: boolean
  /** Quantos episodios usam este quadro. */
  episodios: number
}

/** O que os formularios precisam de um quadro. */
export type QuadroOpcao = Pick<Quadro, 'chave' | 'nome' | 'ideia'>

export interface Membro {
  id: string
  userId: string
  papel: 'monitor' | 'aluno'
  nome: string
  turma: string | null
  matricula: string | null
  responsavelNome: string | null
  cpfMascarado: string | null
  autorizacaoStatus: StatusAutorizacao
  temArquivo: boolean
  anoLetivo: number
  /** Autorizacao aceita e do ano letivo atual. */
  liberado: boolean
  /** Aceita, mas de ano anterior: precisa de termo novo. */
  vencida: boolean
  /** Permissoes dadas pelo monitor/direcao (so valem com termo aceito). */
  podePostar: boolean
  podeAudio: boolean
  /** Liberado + pode postar: pode criar episodio. */
  podeCriar: boolean
}

/** O que o editor do episodio precisa saber de cada pessoa da equipe. Nada de responsavel, CPF ou matricula. */
export interface PessoaEquipe {
  userId: string
  nome: string
  turma: string | null
}

export interface Episodio {
  id: string
  slug: string
  tipo: TipoEpisodio
  quadro: string | null
  /** Nome do quadro, ja resolvido (null se sem quadro ou quadro apagado). */
  quadroNome: string | null
  titulo: string
  resumo: string | null
  texto: string | null
  entrevistadoNome: string | null
  entrevistadoDescricao: string | null
  temTermoEntrevistado: boolean
  audioUrl: string | null
  audioBytes: number | null
  status: StatusEpisodio
  feedback: string | null
  noJbinforma: boolean
  noticiaId: string | null
  autorId: string
  autorNome: string
  participantes: { userId: string; nome: string; turma: string | null }[]
  publicadoEm: string | null
  criadoEm: string
  atualizadoEm: string
}

/** So os digitos. */
export const digitos = (v: string) => v.replace(/\D/g, '')

/** CPF valido pelos digitos verificadores. */
export function cpfValido(v: string): boolean {
  const d = digitos(v)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const dv = (n: number) => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10])
}

export const formatarCpf = (v: string) => {
  const d = digitos(v)
  return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : v
}

/** 123.***.***-45: o bastante para conferir com o papel, sem expor o numero. */
export const mascararCpf = (v: string | null) => {
  if (!v) return null
  const d = digitos(v)
  return d.length === 11 ? `${d.slice(0, 3)}.***.***-${d.slice(9)}` : null
}

/** Ano letivo corrente no fuso da escola. */
export function anoLetivoAtual(agora = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric' }).format(agora))
}

/** Primeiro nome + turma: o que aparece no site publico sobre o aluno. */
export function nomePublico(nome: string, turma: string | null): string {
  const primeiro = nome.trim().split(/\s+/)[0] ?? nome
  return turma ? `${primeiro}, ${turma}` : primeiro
}

export function slugDe(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 140)
    .replace(/^-+|-+$/g, '') || 'episodio'
}

/** Escapa texto para entrar em HTML. */
export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Texto puro digitado pelo aluno -> HTML seguro em paragrafos. */
export function textoParaHtml(texto: string | null): string {
  if (!texto) return ''
  return texto
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

export const tamanhoLegivel = (b: number | null) =>
  b == null ? '' : b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`
