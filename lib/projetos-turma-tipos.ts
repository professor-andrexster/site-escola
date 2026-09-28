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
  comentario: string | null
  status: StatusEnvio
  nota: number | null
  feedback: string | null
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
  criadoEm: string
  avaliador: string | null
}
