import { prisma } from '@/lib/db'
import type { projetos, ideias, trilhas } from '@prisma/client'

/**
 * Projetos, ideias, trilhas e teste vocacional — os modulos da vitrine.
 *
 * Agrupados porque compartilham as trilhas e o vinculo com o aluno, e porque
 * sao pequenos demais para arquivo proprio: juntos somam cerca de 30 chamadas.
 *
 * Duas colunas aqui sao JSON serializado (o mesmo caso da biblioteca):
 * `projetos.tags` e `testes_vocacionais.respostas`.
 */

export type Projeto = projetos
export type Ideia = ideias
export type Trilha = trilhas

/** Converte coluna JSON em lista. Ver lib/db/biblioteca.ts para o porque. */
function comoLista(valor: string | null): string[] {
  if (!valor) return []
  try {
    const v = JSON.parse(valor)
    return Array.isArray(v) ? v.map(String) : [valor]
  } catch {
    return [valor]
  }
}

// ------------------------------------------------------------- trilhas

export async function listarTrilhas(): Promise<Trilha[]> {
  return prisma.trilhas.findMany({ orderBy: { nome: 'asc' } })
}

// ------------------------------------------------------------ projetos

export type ProjetoComTags = Omit<Projeto, 'tags' | 'criado_em'> & {
  tags: string[]
  criado_em: string | null
}

function serializarProjeto(p: Projeto): ProjetoComTags {
  return { ...p, tags: comoLista(p.tags), criado_em: p.criado_em?.toISOString() ?? null }
}

/** Vitrine publica: projetos em destaque, com aluno e trilha. */
export async function projetosEmDestaque() {
  const linhas = await prisma.projetos.findMany({
    where: { destaque: true },
    include: {
      alunos: { select: { nome: true, matricula: true, turma: true, foto_url: true, ativo: true } },
      trilhas: { select: { nome: true, icone: true, cor_tailwind: true } },
    },
    orderBy: { criado_em: 'desc' },
  })
  // Projeto de aluno inativo nao aparece na vitrine publica.
  return linhas
    .filter(p => p.alunos?.ativo !== false)
    .map(p => ({ ...p, tags: comoLista(p.tags) }))
}

export async function projetosDoAluno(alunoId: string): Promise<ProjetoComTags[]> {
  const linhas = await prisma.projetos.findMany({
    where: { aluno_id: alunoId },
    orderBy: { criado_em: 'desc' },
  })
  return linhas.map(serializarProjeto)
}

export async function contarProjetosDoAluno(alunoId: string): Promise<number> {
  return prisma.projetos.count({ where: { aluno_id: alunoId } })
}

// -------------------------------------------------------------- ideias

/** Ideias com contagem de votos e comentarios. */
export async function listarIdeias(status?: string) {
  return prisma.ideias.findMany({
    where: status ? { status } : {},
    include: {
      _count: { select: { ideia_votos: true, ideia_comentarios: true } },
      trilhas: { select: { nome: true, cor_tailwind: true } },
    },
    orderBy: { created_at: 'desc' },
  })
}

export async function buscarIdeia(id: string): Promise<Ideia | null> {
  return prisma.ideias.findUnique({ where: { id } })
}

/**
 * Registra ou remove o voto de um perfil numa ideia. Antes eram um select
 * seguido de insert ou delete; concorrentes podiam gerar voto duplicado.
 * A unique (ideia, perfil) mais o upsert resolvem no banco.
 */
export async function alternarVoto(ideiaId: string, profileId: string): Promise<boolean> {
  const existente = await prisma.ideia_votos.findFirst({
    where: { ideia_id: ideiaId, profile_id: profileId },
    select: { id: true },
  })
  if (existente) {
    await prisma.ideia_votos.delete({ where: { id: existente.id } })
    return false
  }
  await prisma.ideia_votos.create({ data: { ideia_id: ideiaId, profile_id: profileId } })
  return true
}

export async function comentariosDaIdeia(ideiaId: string) {
  return prisma.ideia_comentarios.findMany({
    where: { ideia_id: ideiaId },
    orderBy: { created_at: 'asc' },
  })
}

// ---------------------------------------------------------- vocacional

/** Perfil vocacional do aluno, com as trilhas ordenadas por pontuacao. */
export async function perfilVocacional(alunoId: string) {
  return prisma.perfis_vocacionais.findMany({
    where: { aluno_id: alunoId },
    include: { trilhas: { select: { nome: true, icone: true, cor_tailwind: true } } },
    orderBy: { pontuacao: 'desc' },
  })
}

/** Grava o resultado do teste. `respostas` e JSON serializado. */
export async function registrarTesteVocacional(
  alunoId: string,
  respostas: unknown,
  pontuacoes: Array<{ trilhaId: string; pontuacao: number }>
) {
  return prisma.$transaction(async tx => {
    await tx.testes_vocacionais.create({
      data: { aluno_id: alunoId, respostas: JSON.stringify(respostas), realizado_em: new Date() },
    })
    // Refaz o perfil do zero: refazer o teste substitui o resultado anterior,
    // nao soma a ele.
    await tx.perfis_vocacionais.deleteMany({ where: { aluno_id: alunoId } })
    for (const p of pontuacoes) {
      await tx.perfis_vocacionais.create({
        data: { aluno_id: alunoId, trilha_id: p.trilhaId, pontuacao: p.pontuacao },
      })
    }
  })
}
