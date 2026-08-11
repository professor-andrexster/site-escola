import { prisma } from '@/lib/db'
import type { quizzes, quiz_perguntas, quiz_participantes } from '@prisma/client'

/**
 * Quiz ao vivo (JBQuiz).
 *
 * Maior modulo da migracao: 65 das 371 chamadas originais. Reune quatro
 * tabelas que so fazem sentido juntas — um quiz tem perguntas, recebe
 * participantes, e cada participante deixa respostas.
 *
 * As remocoes em cascata eram feitas a mao no Supabase (apagar respostas,
 * depois participantes, depois o quiz). Aqui viram transacao: ou tudo sai,
 * ou nada sai. Era a fonte mais provavel de participante orfao.
 */

export type Quiz = quizzes
export type Pergunta = quiz_perguntas
export type Participante = quiz_participantes

// -------------------------------------------------------------- leitura

/** Datas em string ISO, como as telas esperam. */
function serializarQuiz(q: quizzes) {
  return {
    ...q,
    created_at: q.created_at.toISOString(),
    updated_at: q.updated_at.toISOString(),
    quiz_iniciado_em: q.quiz_iniciado_em?.toISOString() ?? null,
    pergunta_liberada_em: q.pergunta_liberada_em?.toISOString() ?? null,
    pergunta_atual: q.pergunta_atual ?? 0,
    resposta_revelada: q.resposta_revelada ?? false,
  }
}

export async function buscarPorCodigo(codigo: string) {
  const q = await prisma.quizzes.findFirst({ where: { codigo } })
  return q ? serializarQuiz(q) : null
}

export async function buscarPorId(id: string) {
  const q = await prisma.quizzes.findUnique({ where: { id } })
  return q ? serializarQuiz(q) : null
}

/**
 * Perguntas de um quiz, na ordem.
 *
 * Serializa created_at e estreita resposta_correta para a uniao 'a'|'b'|'c'|'d'
 * que o dominio usa — a coluna e text no banco, e o QuizRoom depende do tipo
 * fechado para renderizar a alternativa certa.
 */
export async function perguntasDoQuiz(quizId: string) {
  const linhas = await prisma.quiz_perguntas.findMany({
    where: { quiz_id: quizId },
    orderBy: { ordem: 'asc' },
  })
  return linhas.map(p => ({
    ...p,
    created_at: p.created_at.toISOString(),
    resposta_correta: p.resposta_correta as 'a' | 'b' | 'c' | 'd',
  }))
}

export async function participante(id: string) {
  const p = await prisma.quiz_participantes.findUnique({ where: { id } })
  return p ? { ...p, created_at: p.created_at.toISOString() } : null
}

export async function participantesDoQuiz(quizId: string) {
  return prisma.quiz_participantes.findMany({
    where: { quiz_id: quizId },
    select: { id: true, nome: true, turma: true },
    orderBy: { nome: 'asc' },
  })
}

export async function contarParticipantes(quizId: string): Promise<number> {
  return prisma.quiz_participantes.count({ where: { quiz_id: quizId } })
}

/** Quantos quizzes um usuario ja concluiu. */
export async function contarConcluidosDoUsuario(userId: string): Promise<number> {
  return prisma.quiz_participantes.count({ where: { user_id: userId, concluido: true } })
}

/** Participacoes de um usuario num conjunto de quizzes. */
export async function participacoesDoUsuario(userId: string, quizIds: string[]) {
  return prisma.quiz_participantes.findMany({
    where: { user_id: userId, quiz_id: { in: quizIds } },
    select: { id: true, quiz_id: true, concluido: true },
  })
}

/** Perguntas ja respondidas por um participante. */
export async function perguntasRespondidas(participanteId: string): Promise<string[]> {
  const linhas = await prisma.quiz_respostas.findMany({
    where: { participante_id: participanteId },
    select: { pergunta_id: true },
  })
  return linhas.map(l => l.pergunta_id)
}

/**
 * Quizzes que um aluno pode entrar: nao encerrados, com sala aberta ou em
 * andamento. O filtro por turma fica na tela, que conhece quizMatchesTurma —
 * a regra de "1° Ano" casar com "1° Ano A" e de apresentacao, nao de banco.
 */
export async function disponiveisParaEntrar() {
  const linhas = await prisma.quizzes.findMany({
    where: { encerrado: false, OR: [{ lobby_aberto: true }, { ativo: true }] },
    select: {
      id: true, titulo: true, codigo: true, turma_alvo: true,
      lobby_aberto: true, ativo: true, tempo_por_pergunta: true,
      _count: { select: { quiz_perguntas: true } },
    },
  })
  // A tela conta perguntas pelo tamanho do array, herdado do formato do
  // Supabase. Manter o mesmo formato evita mexer no JSX.
  return linhas.map(q => ({
    ...q,
    quiz_perguntas: Array.from({ length: q._count.quiz_perguntas }, () => ({ id: '' })),
  }))
}

/** Ultimas participacoes concluidas de um aluno, com o titulo do quiz. */
export async function historicoDoUsuario(userId: string, limite = 5) {
  const linhas = await prisma.quiz_participantes.findMany({
    where: { user_id: userId, concluido: true },
    include: { quizzes: { select: { titulo: true, codigo: true } } },
    orderBy: { created_at: 'desc' },
    take: limite,
  })
  return linhas.map(p => ({ ...p, created_at: p.created_at.toISOString() }))
}

/** Numeros do painel de professor e gestao. */
export async function totaisDoPainel() {
  const [quizzes, participantesConcluidos] = await Promise.all([
    prisma.quizzes.count(),
    prisma.quiz_participantes.count({ where: { concluido: true } }),
  ])
  return { quizzes, participantesConcluidos }
}

/**
 * Ranking geral acumulado por aluno.
 *
 * Substitui a funcao ranking_geral_quiz() do Postgres — uma das seis que
 * moravam no banco. Ela era SECURITY DEFINER, ou seja, rodava com os
 * privilegios do dono para atravessar o RLS de profiles. Sem RLS, isso deixa
 * de ser necessario: a consulta e a mesma, so que em codigo.
 */
export async function rankingGeral() {
  const somas = await prisma.quiz_participantes.groupBy({
    by: ['user_id'],
    where: { concluido: true, user_id: { not: null } },
    _sum: { pontuacao_total: true },
  })
  if (!somas.length) return []

  const ids = somas.map(s => s.user_id!).filter(Boolean)
  const perfis = await prisma.profiles.findMany({
    where: { id: { in: ids } },
    select: { id: true, nome_completo: true, turma: true },
  })
  const porId = new Map(perfis.map(p => [p.id, p]))

  return somas
    .map(s => {
      const perfil = porId.get(s.user_id!)
      return {
        user_id: s.user_id!,
        nome_completo: perfil?.nome_completo ?? '',
        turma: perfil?.turma ?? null,
        pontuacao_total: s._sum.pontuacao_total ?? 0,
      }
    })
    .filter(r => r.nome_completo)
    .sort((a, b) => b.pontuacao_total - a.pontuacao_total)
}

/**
 * Ranking publico: quizzes ao vivo ou encerrados, cada um com os dez
 * primeiros de quem concluiu.
 *
 * O `include` com `take` resolve os onze SELECTs que a pagina fazia em
 * sequencia (um por quiz, dentro de um Promise.all) numa consulta so.
 */
export async function rankingPublico() {
  const linhas = await prisma.quizzes.findMany({
    where: { OR: [{ ativo: true }, { encerrado: true }] },
    select: {
      id: true, titulo: true, codigo: true, ativo: true, encerrado: true, created_at: true,
      quiz_participantes: {
        where: { concluido: true },
        select: { id: true, nome: true, turma: true, pontuacao_total: true },
        orderBy: { pontuacao_total: 'desc' },
        take: 10,
      },
    },
    orderBy: { created_at: 'desc' },
  })
  return linhas.map(({ quiz_participantes, ...q }) => ({
    ...q,
    created_at: q.created_at.toISOString(),
    participantes: quiz_participantes,
  }))
}

/** Historico completo de um aluno, com acertos por quiz. */
export async function meusQuizzes(userId: string) {
  const linhas = await prisma.quiz_participantes.findMany({
    where: { user_id: userId, concluido: true },
    include: {
      quizzes: { select: { titulo: true, codigo: true, encerrado: true } },
      quiz_respostas: { select: { correta: true } },
    },
    orderBy: { created_at: 'desc' },
  })
  return linhas.map(p => ({ ...p, created_at: p.created_at.toISOString() }))
}

/** Participantes com as respostas, para o ranking detalhado do professor. */
export async function participantesComRespostas(quizId: string) {
  const linhas = await prisma.quiz_participantes.findMany({
    where: { quiz_id: quizId },
    include: { quiz_respostas: { select: { correta: true, pontos_obtidos: true } } },
    orderBy: { pontuacao_total: 'desc' },
  })
  return linhas.map(p => ({ ...p, created_at: p.created_at.toISOString() }))
}

/** Ranking de um quiz especifico, so quem concluiu. */
export async function rankingDoQuiz(quizId: string) {
  return prisma.quiz_participantes.findMany({
    where: { quiz_id: quizId, concluido: true },
    select: { id: true, nome: true, turma: true, pontuacao_total: true },
    orderBy: { pontuacao_total: 'desc' },
  })
}

/** Respostas de um participante, com o enunciado e o gabarito de cada uma. */
export async function respostasComPerguntas(participanteId: string) {
  return prisma.quiz_respostas.findMany({
    where: { participante_id: participanteId },
    include: {
      quiz_perguntas: { select: { enunciado: true, resposta_correta: true, pontos: true } },
    },
  })
}

/** Quantas perguntas o quiz tem. */
export async function contarPerguntas(quizId: string): Promise<number> {
  return prisma.quiz_perguntas.count({ where: { quiz_id: quizId } })
}

/** Todos os quizzes, para a tela de gestao. */
export async function listarQuizzes() {
  const linhas = await prisma.quizzes.findMany({
    include: { _count: { select: { quiz_perguntas: true, quiz_participantes: true } } },
    orderBy: { created_at: 'desc' },
  })
  return linhas.map(q => ({
    ...q,
    created_at: q.created_at.toISOString(),
    updated_at: q.updated_at.toISOString(),
    quiz_iniciado_em: q.quiz_iniciado_em?.toISOString() ?? null,
    pergunta_liberada_em: q.pergunta_liberada_em?.toISOString() ?? null,
    totalPerguntas: q._count.quiz_perguntas,
    totalParticipantes: q._count.quiz_participantes,
    // A tela conta pelo tamanho do array, formato herdado do join do
    // PostgREST. Mesma concessao feita no dashboard: trocar por _count e
    // limpeza de tela, nao migracao de banco.
    quiz_perguntas: Array.from({ length: q._count.quiz_perguntas }, () => ({ id: '' })),
    quiz_participantes: Array.from({ length: q._count.quiz_participantes }, () => ({ id: '' })),
  }))
}

// -------------------------------------------------------------- escrita

export async function criarPerguntas(
  quizId: string,
  perguntas: Array<Omit<Pergunta, 'id' | 'quiz_id'>>
) {
  return prisma.quiz_perguntas.createMany({
    data: perguntas.map(p => ({ ...p, quiz_id: quizId })),
  })
}

export async function removerPergunta(id: string) {
  return prisma.quiz_perguntas.delete({ where: { id } })
}

/**
 * Reordena perguntas numa transacao. Antes eram dois UPDATE soltos: se o
 * segundo falhasse, duas perguntas ficavam com a mesma ordem.
 */
export async function trocarOrdem(idA: string, ordemA: number, idB: string, ordemB: number) {
  return prisma.$transaction([
    prisma.quiz_perguntas.update({ where: { id: idA }, data: { ordem: ordemA } }),
    prisma.quiz_perguntas.update({ where: { id: idB }, data: { ordem: ordemB } }),
  ])
}

/**
 * Grava a resposta de um participante. Upsert na unique (participante,
 * pergunta): responder duas vezes a mesma pergunta atualiza, nao duplica.
 *
 * Os nomes seguem o schema real — `resposta`, `tempo_resposta`,
 * `pontos_obtidos`. Vale dizer: escrevi este arquivo a partir das consultas
 * antigas e errei tres nomes; o TypeScript nao acusou porque objeto passado
 * como variavel nao sofre checagem de propriedade excedente.
 */
export async function registrarResposta(dados: {
  participante_id: string
  pergunta_id: string
  resposta: string | null
  correta: boolean
  tempo_resposta?: number | null
  pontos_obtidos: number
}) {
  const { participante_id, pergunta_id, ...resto } = dados
  return prisma.quiz_respostas.upsert({
    where: { participante_id_pergunta_id: { participante_id, pergunta_id } },
    create: { participante_id, pergunta_id, ...resto },
    update: resto,
  })
}

/**
 * Reabre um quiz: apaga respostas, participantes e zera o estado, tudo ou
 * nada. No Supabase eram tres chamadas independentes — falha no meio deixava
 * participante sem resposta, ou respostas apontando para participante que ja
 * nao existia.
 */
export async function reabrir(quizId: string) {
  return prisma.$transaction(async tx => {
    const ids = (
      await tx.quiz_participantes.findMany({
        where: { quiz_id: quizId },
        select: { id: true },
      })
    ).map(p => p.id)

    if (ids.length) {
      await tx.quiz_respostas.deleteMany({ where: { participante_id: { in: ids } } })
      await tx.quiz_participantes.deleteMany({ where: { quiz_id: quizId } })
    }
    // Todos os campos de estado da rodada voltam ao inicio. Deixar qualquer
    // um para tras faz o quiz reabrir ja na pergunta em que travou.
    return tx.quizzes.update({
      where: { id: quizId },
      data: {
        encerrado: false,
        ativo: false,
        lobby_aberto: true,
        quiz_iniciado_em: null,
        pergunta_atual: 0,
        pergunta_liberada_em: null,
        resposta_revelada: false,
        updated_at: new Date(),
      },
    })
  })
}

/**
 * Encerra a rodada: marca o quiz como encerrado e consolida a pontuacao de
 * cada participante. Marcar primeiro e proposital — quem ainda esta na tela
 * para de responder antes de somarmos os pontos.
 */
export async function encerrar(quizId: string) {
  return prisma.$transaction(async tx => {
    await tx.quizzes.update({
      where: { id: quizId },
      data: { ativo: false, lobby_aberto: false, encerrado: true, updated_at: new Date() },
    })

    const participantes = await tx.quiz_participantes.findMany({
      where: { quiz_id: quizId },
      select: { id: true },
    })
    if (!participantes.length) return { participantes: 0 }

    const somas = await tx.quiz_respostas.groupBy({
      by: ['participante_id'],
      where: { participante_id: { in: participantes.map(p => p.id) } },
      _sum: { pontos_obtidos: true },
    })
    const total = new Map(somas.map(s => [s.participante_id, s._sum.pontos_obtidos ?? 0]))

    for (const p of participantes) {
      await tx.quiz_participantes.update({
        where: { id: p.id },
        data: { concluido: true, pontuacao_total: total.get(p.id) ?? 0 },
      })
    }
    return { participantes: participantes.length }
  })
}

/** Apaga o quiz inteiro, com perguntas, participantes e respostas. */
export async function remover(quizId: string) {
  return prisma.$transaction(async tx => {
    const ids = (
      await tx.quiz_participantes.findMany({
        where: { quiz_id: quizId },
        select: { id: true },
      })
    ).map(p => p.id)

    if (ids.length) {
      await tx.quiz_respostas.deleteMany({ where: { participante_id: { in: ids } } })
    }
    await tx.quiz_participantes.deleteMany({ where: { quiz_id: quizId } })
    await tx.quiz_perguntas.deleteMany({ where: { quiz_id: quizId } })
    return tx.quizzes.delete({ where: { id: quizId } })
  })
}
