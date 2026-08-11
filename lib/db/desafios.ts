import { prisma } from '@/lib/db'

/**
 * Desafios e equipes — o modulo de projeto integrador.
 *
 * A consulta da tela de um desafio era um join encadeado do PostgREST com
 * quatro niveis (equipes -> membros -> perfil e papel, mais entregas). Aqui
 * ela vira include aninhado, que le melhor e nao depende de decifrar a
 * sintaxe de string do PostgREST.
 */

/**
 * Um desafio, no formato que a tela espera.
 *
 * Cinco campos sao anulaveis no banco e nao-nulos no tipo do dominio —
 * mesmo padrao que ja apareceu em cursos, aulas, projetos e profiles.
 * Os valores de fallback aqui sao os que a tela ja assumia na pratica.
 */
export async function buscarDesafio(id: string) {
  const d = await prisma.desafios.findUnique({ where: { id } })
  if (!d) return null
  return {
    ...d,
    ano_letivo: d.ano_letivo ?? '',
    pontos_total: d.pontos_total ?? 0,
    publicado: d.publicado ?? false,
    created_at: d.created_at?.toISOString() ?? '',
    updated_at: d.updated_at?.toISOString() ?? '',
  }
}

export async function fasesDoDesafio(desafioId: string) {
  const linhas = await prisma.desafio_fases.findMany({
    where: { desafio_id: desafioId },
    orderBy: { ordem: 'asc' },
  })
  return linhas.map(f => ({ ...f, pontos_max: f.pontos_max ?? 0 }))
}

export async function papeisDoDesafio(desafioId: string) {
  return prisma.desafio_papeis.findMany({ where: { desafio_id: desafioId } })
}

/**
 * Equipes com membros (perfil e papel) e entregas.
 *
 * Tres conversoes acontecem aqui:
 *   - datas viram string ISO, como no resto da migracao;
 *   - `nota` e numeric no banco e o Prisma devolve Decimal, que o React nao
 *     sabe renderizar — vira number;
 *   - `dados_estruturados` era jsonb e virou JSON serializado.
 *
 * Os aliases `profile` e `papel` reproduzem os nomes que o select do PostgREST
 * dava ao join; o componente ja os consome assim.
 */
export async function equipesDoDesafio(desafioId: string) {
  const linhas = await prisma.equipes.findMany({
    where: { desafio_id: desafioId },
    include: {
      equipe_membros: {
        include: {
          profiles: { select: { nome_completo: true } },
          desafio_papeis: { select: { nome: true } },
        },
      },
      entregas: true,
    },
    orderBy: { created_at: 'asc' },
  })

  return linhas.map(e => ({
    ...e,
    created_at: e.created_at?.toISOString() ?? '',
    equipe_membros: e.equipe_membros.map(m => ({
      ...m,
      profile: m.profiles,
      papel: m.desafio_papeis,
    })),
    entregas: e.entregas.map(en => ({
      ...en,
      nota: en.nota === null ? null : Number(en.nota),
      status: (en.status ?? 'pendente') as 'pendente' | 'entregue' | 'avaliada',
      dados_estruturados: en.dados_estruturados
        ? (JSON.parse(en.dados_estruturados) as Record<string, unknown>)
        : null,
      enviado_em: en.enviado_em?.toISOString() ?? null,
      avaliado_em: en.avaliado_em?.toISOString() ?? null,
    })),
  }))
}

/** Ideias ainda em triagem, para vincular a um desafio. */
export async function ideiasEmTriagem() {
  const linhas = await prisma.ideias.findMany({
    where: { status: { in: ['nova', 'em_analise'] } },
    select: { id: true, titulo: true, status: true },
    orderBy: { created_at: 'desc' },
  })
  return linhas.map(i => ({ ...i, status: i.status ?? 'nova' }))
}

/**
 * Lista para a vitrine de desafios. Quem nao pode criar so enxerga os
 * publicados — o rascunho de um professor nao aparece para o aluno.
 */
export async function listarDesafios(apenasPublicados = false) {
  return prisma.desafios.findMany({
    where: apenasPublicados ? { publicado: true } : {},
    orderBy: { created_at: 'desc' },
    include: {
      desafio_fases: { select: { id: true } },
      equipes: { select: { id: true } },
    },
  })
}

// ------------------------------------------------------------ escrita

/** Cria desafio, fases e papeis numa transacao — eram tres inserts soltos. */
export async function criarDesafio(dados: {
  professorId: string
  titulo: string
  subtitulo: string | null
  briefing: string | null
  turmaAlvo: string | null
  anoLetivo: string
  pontosTotal: number
  publicado: boolean
  fases: Array<{
    titulo: string
    descricao: string | null
    entregavel_instrucoes: string | null
    pontos_max: number
    semana_sugerida: number | null
  }>
  papeis: Array<{ nome: string; descricao: string | null }>
}) {
  return prisma.$transaction(async tx => {
    const desafio = await tx.desafios.create({
      data: {
        titulo: dados.titulo,
        subtitulo: dados.subtitulo,
        briefing: dados.briefing,
        professor_id: dados.professorId,
        turma_alvo: dados.turmaAlvo,
        ano_letivo: dados.anoLetivo,
        pontos_total: dados.pontosTotal,
        publicado: dados.publicado,
      },
      select: { id: true },
    })

    if (dados.fases.length) {
      await tx.desafio_fases.createMany({
        data: dados.fases.map((f, i) => ({ ...f, desafio_id: desafio.id, ordem: i + 1 })),
      })
    }
    if (dados.papeis.length) {
      await tx.desafio_papeis.createMany({
        data: dados.papeis.map(p => ({ ...p, desafio_id: desafio.id })),
      })
    }
    return desafio
  })
}

/** Cria a equipe com os integrantes de uma vez. */
export async function criarEquipe(dados: {
  desafioId: string
  nomeEmpresa: string | null
  ideiaId: string | null
  turma: string | null
  membros: string[]
}) {
  return prisma.$transaction(async tx => {
    const equipe = await tx.equipes.create({
      data: {
        desafio_id: dados.desafioId,
        nome_empresa: dados.nomeEmpresa,
        ideia_id: dados.ideiaId,
        turma: dados.turma,
      },
      select: { id: true },
    })
    if (dados.membros.length) {
      await tx.equipe_membros.createMany({
        data: dados.membros.map(profileId => ({ equipe_id: equipe.id, profile_id: profileId })),
      })
    }
    return equipe
  })
}

export async function entrarNaEquipe(equipeId: string, profileId: string) {
  return prisma.equipe_membros.create({ data: { equipe_id: equipeId, profile_id: profileId } })
}

export async function definirPapel(membroId: string, papelId: string | null) {
  return prisma.equipe_membros.update({ where: { id: membroId }, data: { papel_id: papelId } })
}

/** De qual desafio e a equipe, e quem sao os integrantes. */
export async function equipeComMembros(equipeId: string) {
  return prisma.equipes.findUnique({
    where: { id: equipeId },
    select: {
      id: true,
      desafio_id: true,
      equipe_membros: { select: { id: true, profile_id: true } },
    },
  })
}

/** A qual equipe um vinculo pertence — para conferir dono antes de gravar. */
export async function equipeDoMembro(membroId: string) {
  const m = await prisma.equipe_membros.findUnique({
    where: { id: membroId },
    select: { equipe_id: true, profile_id: true },
  })
  return m
}

export async function faseDoDesafio(faseId: string) {
  return prisma.desafio_fases.findUnique({
    where: { id: faseId },
    select: { id: true, desafio_id: true, pontos_max: true },
  })
}

export async function professorDoDesafio(desafioId: string) {
  const d = await prisma.desafios.findUnique({
    where: { id: desafioId },
    select: { professor_id: true },
  })
  return d?.professor_id ?? null
}

/** Entrega da equipe. Nota e feedback nunca entram por aqui. */
export async function enviarEntrega(dados: {
  equipeId: string
  faseId: string
  conteudo: string | null
  linkUrl: string | null
  arquivoUrl: string | null
}) {
  const valores = {
    conteudo: dados.conteudo,
    link_url: dados.linkUrl,
    arquivo_url: dados.arquivoUrl,
    status: 'entregue',
    enviado_em: new Date(),
  }
  return prisma.entregas.upsert({
    where: { equipe_id_fase_id: { equipe_id: dados.equipeId, fase_id: dados.faseId } },
    create: { equipe_id: dados.equipeId, fase_id: dados.faseId, ...valores },
    update: valores,
  })
}

/** Avaliacao da entrega. Conteudo e link nunca entram por aqui. */
export async function avaliarEntrega(dados: {
  equipeId: string
  faseId: string
  nota: number | null
  feedback: string | null
}) {
  const valores = {
    nota: dados.nota,
    feedback_professor: dados.feedback,
    status: 'avaliada',
    avaliado_em: new Date(),
  }
  return prisma.entregas.upsert({
    where: { equipe_id_fase_id: { equipe_id: dados.equipeId, fase_id: dados.faseId } },
    create: { equipe_id: dados.equipeId, fase_id: dados.faseId, ...valores },
    update: valores,
  })
}
