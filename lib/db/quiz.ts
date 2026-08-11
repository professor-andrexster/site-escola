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

export async function buscarPorCodigo(codigo: string): Promise<Quiz | null> {
  return prisma.quizzes.findFirst({ where: { codigo } })
}

export async function buscarPorId(id: string): Promise<Quiz | null> {
  return prisma.quizzes.findUnique({ where: { id } })
}

export async function perguntasDoQuiz(quizId: string): Promise<Pergunta[]> {
  return prisma.quiz_perguntas.findMany({
    where: { quiz_id: quizId },
    orderBy: { ordem: 'asc' },
  })
}

export async function participante(id: string): Promise<Participante | null> {
  return prisma.quiz_participantes.findUnique({ where: { id } })
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
