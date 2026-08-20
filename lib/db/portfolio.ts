import { prisma } from '@/lib/db'

/**
 * O portfólio do aluno.
 *
 * Reaproveita a tabela `projetos`, que já existia para a vitrine pública — o que
 * mudou é quem alimenta. Antes só a gestão cadastrava projeto por aluno; agora o
 * próprio aluno cadastra, e o que ele envia passa por revisão antes de aparecer
 * no site aberto.
 *
 * Os projetos que já estavam lá foram cadastrados pela gestão e continuam
 * valendo: por isso o padrão da coluna `status` é `aprovado`. O fluxo de revisão
 * começa em quem envia daqui para frente.
 */

export const STATUS = ['rascunho', 'pendente', 'aprovado', 'recusado'] as const
export type StatusProjeto = (typeof STATUS)[number]

export interface ProjetoDoAluno {
  id: string
  titulo: string
  descricao: string | null
  imagemUrl: string | null
  linkSite: string | null
  linkRepo: string | null
  status: StatusProjeto
  motivoRecusa: string | null
  criadoEm: Date | null
  revisadoEm: Date | null
  trilhaNome: string | null
}

/**
 * O registro de aluno de quem está logado.
 *
 * `projetos.aluno_id` aponta para `alunos`, não para o usuário — e nem todo
 * usuário tem ficha de aluno (professor, gestão). Quem não tem, não publica
 * portfólio, e a tela precisa dizer isso em vez de quebrar.
 */
export async function alunoDoUsuario(userId: string) {
  return prisma.alunos.findFirst({
    where: { user_id: userId },
    select: { id: true, nome: true, serie: true, turma: true, ativo: true },
  })
}

function paraProjeto(p: {
  id: string; titulo: string; descricao: string | null; imagem_url: string | null
  link_externo: string | null; repo_url: string | null; status: string
  motivo_recusa: string | null; criado_em: Date | null; revisado_em: Date | null
  trilhas: { nome: string } | null
}): ProjetoDoAluno {
  return {
    id: p.id,
    titulo: p.titulo,
    descricao: p.descricao,
    imagemUrl: p.imagem_url,
    linkSite: p.link_externo,
    linkRepo: p.repo_url,
    status: (STATUS as readonly string[]).includes(p.status)
      ? (p.status as StatusProjeto)
      : 'aprovado',
    motivoRecusa: p.motivo_recusa,
    criadoEm: p.criado_em,
    revisadoEm: p.revisado_em,
    trilhaNome: p.trilhas?.nome ?? null,
  }
}

const SELECAO = {
  id: true, titulo: true, descricao: true, imagem_url: true,
  link_externo: true, repo_url: true, status: true, motivo_recusa: true,
  criado_em: true, revisado_em: true,
  trilhas: { select: { nome: true } },
} as const

/** Os projetos de um aluno, do mais recente para o mais antigo. */
export async function projetosDoAluno(alunoId: string): Promise<ProjetoDoAluno[]> {
  const linhas = await prisma.projetos.findMany({
    where: { aluno_id: alunoId },
    orderBy: { criado_em: 'desc' },
    select: SELECAO,
  })
  return linhas.map(paraProjeto)
}

/** Um projeto específico, já conferindo que é do aluno que pediu. */
export async function projetoDoAluno(id: string, alunoId: string) {
  const p = await prisma.projetos.findFirst({
    where: { id, aluno_id: alunoId },
    select: SELECAO,
  })
  return p ? paraProjeto(p) : null
}

/** A fila de revisão do professor: o que os alunos enviaram e aguarda resposta. */
export async function filaDeRevisao() {
  const linhas = await prisma.projetos.findMany({
    where: { status: 'pendente' },
    orderBy: { criado_em: 'asc' },
    select: {
      ...SELECAO,
      alunos: { select: { id: true, nome: true, serie: true, turma: true } },
    },
  })
  return linhas.map(p => ({
    ...paraProjeto(p),
    aluno: p.alunos
      ? { id: p.alunos.id, nome: p.alunos.nome, serie: p.alunos.serie, turma: p.alunos.turma }
      : null,
  }))
}

/** Quantos projetos aguardam revisão — para o aviso no menu do professor. */
export function contarPendentes() {
  return prisma.projetos.count({ where: { status: 'pendente' } })
}

/**
 * Valida um endereço que o aluno digitou.
 *
 * Só http e https entram. `javascript:` num link que a escola publica seria um
 * furo aberto, e a validação precisa acontecer aqui, no servidor — o campo
 * `type="url"` do formulário é conveniência, não defesa.
 */
export function enderecoValido(valor: string | null | undefined): string | null {
  if (!valor) return null
  const limpo = valor.trim()
  if (!limpo) return null
  try {
    const u = new URL(limpo)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.toString().slice(0, 300)
  } catch {
    return null
  }
}
