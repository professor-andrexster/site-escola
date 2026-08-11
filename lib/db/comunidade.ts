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

/** Registra um contato do formulario publico. */
export async function criarLead(dados: {
  nome: string
  email: string
  telefone?: string | null
  mensagem?: string | null
}) {
  return prisma.leads.create({ data: dados })
}

/** Leads de contato, mais recentes primeiro. */
export async function listarLeads() {
  const linhas = await prisma.leads.findMany({ orderBy: { created_at: 'desc' } })
  return linhas.map(l => ({ ...l, created_at: l.created_at?.toISOString() ?? null }))
}

export async function marcarLeadLido(id: string) {
  return prisma.leads.update({ where: { id }, data: { lido: true } })
}

export async function removerLead(id: string) {
  return prisma.leads.delete({ where: { id } })
}

/** Ideias com votos e trilhas, para o quadro de triagem. */
export async function quadroDeIdeias() {
  const [ideias, votos, trilhas] = await Promise.all([
    prisma.ideias.findMany({
      include: {
        profiles: { select: { id: true, nome_completo: true, turma: true } },
        trilhas: { select: { id: true, nome: true, icone: true, cor_tailwind: true } },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.ideia_votos.findMany({ select: { ideia_id: true, profile_id: true } }),
    prisma.trilhas.findMany({ orderBy: { nome: 'asc' } }),
  ])
  return {
    ideias: ideias.map(i => ({
      ...i,
      status: (i.status ?? 'nova') as 'nova' | 'em_analise' | 'adotada' | 'arquivada',
      created_at: i.created_at?.toISOString() ?? '',
      updated_at: i.updated_at?.toISOString() ?? '',
      // Nomes que o select do PostgREST dava ao join.
      autor: i.profiles,
      trilha: i.trilhas,
    })),
    votos,
    trilhas,
  }
}

/** Leads de contato ainda nao lidos — contador do painel da gestao. */
export async function leadsNaoLidos(): Promise<number> {
  return prisma.leads.count({ where: { lido: false } })
}

/**
 * Conteudo editavel de uma pagina estatica (EMTI, projeto de vida etc).
 * A gestao edita pelo painel; a pagina publica so le.
 */
export async function conteudoDaPagina(pagina: string) {
  return prisma.paginas_conteudo.findFirst({ where: { pagina } })
}

/** Grava o conteudo de uma pagina institucional. Uma linha por pagina. */
export async function salvarPagina(pagina: string, titulo: string, conteudo: string) {
  return prisma.paginas_conteudo.upsert({
    where: { pagina },
    create: { pagina, titulo, conteudo },
    update: { titulo, conteudo, updated_at: new Date() },
  })
}

export async function listarPaginasEditaveis(chaves?: string[]) {
  const linhas = await prisma.paginas_conteudo.findMany({
    where: chaves ? { pagina: { in: chaves } } : {},
    orderBy: { pagina: 'asc' },
  })
  return linhas.map(l => ({ ...l, updated_at: l.updated_at?.toISOString() ?? '' }))
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

export async function projetosDoAluno(alunoId: string): Promise<ProjetoComTags[]> {
  const linhas = await prisma.projetos.findMany({
    where: { aluno_id: alunoId },
    orderBy: { criado_em: 'desc' },
  })
  return linhas.map(serializarProjeto)
}

/** Projetos de um aluno com a trilha inteira — a tela de gestao do portfolio. */
export async function projetosDoAlunoComTrilha(alunoId: string) {
  const linhas = await prisma.projetos.findMany({
    where: { aluno_id: alunoId },
    include: { trilhas: true },
    orderBy: { criado_em: 'desc' },
  })
  return linhas.map(p => ({
    ...p,
    // aluno_id e destaque sao anulaveis no banco mas nao no dominio: o filtro
    // acima ja garante o primeiro, e projeto sem destaque e destaque false.
    aluno_id: alunoId,
    destaque: p.destaque ?? false,
    tags: comoLista(p.tags),
    criado_em: p.criado_em?.toISOString() ?? '',
  }))
}

export async function contarProjetosDoAluno(alunoId: string): Promise<number> {
  return prisma.projetos.count({ where: { aluno_id: alunoId } })
}

/** Projetos em destaque para a home e a vitrine publica. */
export async function projetosPublicos(opcoes: { apenasDestaque?: boolean; limite?: number } = {}) {
  const linhas = await prisma.projetos.findMany({
    where: opcoes.apenasDestaque ? { destaque: true } : {},
    include: {
      alunos: { select: { nome: true, matricula: true, serie: true, turma: true, foto_url: true, ativo: true } },
      trilhas: { select: { nome: true, icone: true, cor_tailwind: true } },
    },
    // Destaque primeiro, e dentro dele o mais recente — a mesma ordem dupla
    // que a vitrine usava no PostgREST.
    orderBy: [{ destaque: 'desc' }, { criado_em: 'desc' }],
    ...(opcoes.limite ? { take: opcoes.limite } : {}),
  })
  // Projeto sem aluno ativo sai da vitrine publica — inclusive o que nao tem
  // ficha vinculada, que era o que o filtro antigo (`aluno?.ativo`) fazia.
  return linhas
    .filter((p): p is typeof p & { alunos: NonNullable<typeof p.alunos> } => p.alunos?.ativo === true)
    .map(p => ({
      ...p,
      alunos: { ...p.alunos, ativo: true },
      tags: comoLista(p.tags),
      destaque: p.destaque ?? false,
      criado_em: p.criado_em?.toISOString() ?? '',
    }))
}

/** Ficha completa de uma ideia: comentarios e votos. */
export async function fichaDaIdeia(id: string) {
  const [ideia, comentarios, votos] = await Promise.all([
    prisma.ideias.findUnique({
      where: { id },
      include: {
        profiles: { select: { id: true, nome_completo: true, turma: true } },
        trilhas: { select: { id: true, nome: true, icone: true, cor_tailwind: true } },
      },
    }),
    prisma.ideia_comentarios.findMany({
      where: { ideia_id: id },
      include: { profiles: { select: { nome_completo: true } } },
      orderBy: { created_at: 'asc' },
    }),
    prisma.ideia_votos.findMany({ where: { ideia_id: id }, select: { ideia_id: true, profile_id: true } }),
  ])
  if (!ideia) return null
  return {
    ideia: {
      ...ideia,
      status: (ideia.status ?? 'nova') as 'nova' | 'em_analise' | 'adotada' | 'arquivada',
      created_at: ideia.created_at?.toISOString() ?? '',
      updated_at: ideia.updated_at?.toISOString() ?? '',
      autor: ideia.profiles,
      trilha: ideia.trilhas,
    },
    comentarios: comentarios.map(c => ({
      ...c,
      created_at: c.created_at?.toISOString() ?? '',
      autor: c.profiles,
    })),
    votos,
  }
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

/** Publica a ideia. O autor sai da sessao, nunca do corpo do pedido. */
export async function criarIdeia(dados: {
  autorId: string
  titulo: string
  dor: string | null
  lacuna: string | null
  inovacao: string | null
  trilhaId: string | null
}) {
  const i = await prisma.ideias.create({
    data: {
      autor_id: dados.autorId,
      titulo: dados.titulo,
      dor: dados.dor,
      lacuna: dados.lacuna,
      inovacao: dados.inovacao,
      trilha_id: dados.trilhaId,
    },
    include: {
      profiles: { select: { nome_completo: true, turma: true } },
      trilhas: { select: { nome: true, icone: true, cor_tailwind: true } },
    },
  })
  const { profiles, trilhas, ...ideia } = i
  return {
    ...ideia,
    status: (ideia.status ?? 'nova') as 'nova' | 'em_analise' | 'adotada' | 'arquivada',
    created_at: ideia.created_at?.toISOString() ?? '',
    updated_at: ideia.updated_at?.toISOString() ?? '',
    autor: profiles,
    trilha: trilhas,
  }
}

export async function mudarStatusDaIdeia(id: string, status: string) {
  return prisma.ideias.update({ where: { id }, data: { status, updated_at: new Date() } })
}

/** Comenta na ideia. Devolve o comentario ja com o nome de quem escreveu. */
export async function comentarNaIdeia(ideiaId: string, autorId: string, corpo: string) {
  const c = await prisma.ideia_comentarios.create({
    data: { ideia_id: ideiaId, autor_id: autorId, corpo },
    include: { profiles: { select: { nome_completo: true, role: true } } },
  })
  const { profiles, ...comentario } = c
  return { ...comentario, created_at: comentario.created_at?.toISOString() ?? '', autor: profiles }
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
