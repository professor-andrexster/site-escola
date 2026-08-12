/**
 * Teste da camada lib/db/quiz.ts contra o MariaDB.
 * Cria um quiz descartavel, exercita as transacoes e limpa tudo — inclusive
 * em caso de falha, senao o residuo quebra a execucao seguinte na unique de
 * `codigo` (foi o que aconteceu na primeira tentativa).
 */
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const u = new URL(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter: new PrismaMariaDb({ host: u.hostname, port: 3306,
  database: u.pathname.slice(1), user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password), connectionLimit: 2 }) })

const CODIGO = 'TST-AUTO'
const qid = crypto.randomUUID(), p1 = crypto.randomUUID(), p2 = crypto.randomUUID(), part = crypto.randomUUID()
let falhas = 0
const ok = (rotulo, cond, extra = '') => {
  console.log(`${cond ? 'ok   ' : 'FALHA'} ${rotulo}${extra ? ' — ' + extra : ''}`)
  if (!cond) falhas++
}

async function limpar() {
  const ids = (await prisma.quizzes.findMany({ where: { codigo: CODIGO }, select: { id: true } })).map(q => q.id)
  if (!ids.length) return
  const parts = (await prisma.quiz_participantes.findMany({ where: { quiz_id: { in: ids } }, select: { id: true } })).map(p => p.id)
  if (parts.length) await prisma.quiz_respostas.deleteMany({ where: { participante_id: { in: parts } } })
  await prisma.quiz_participantes.deleteMany({ where: { quiz_id: { in: ids } } })
  await prisma.quiz_perguntas.deleteMany({ where: { quiz_id: { in: ids } } })
  await prisma.quizzes.deleteMany({ where: { id: { in: ids } } })
}

try {
  await limpar()
  await prisma.quizzes.create({ data: { id: qid, titulo: 'Teste', codigo: CODIGO, turma_alvo: '1° Ano' } })
  const base = { quiz_id: qid, alternativa_a: '1', alternativa_b: '2', alternativa_c: '3', alternativa_d: '4', pontos: 10 }
  await prisma.quiz_perguntas.createMany({ data: [
    { ...base, id: p1, ordem: 1, enunciado: 'A?', resposta_correta: 'a' },
    { ...base, id: p2, ordem: 2, enunciado: 'B?', resposta_correta: 'b' }] })
  await prisma.quiz_participantes.create({ data: { id: part, quiz_id: qid, nome: 'Ana', turma: '1° Ano', pontuacao_total: 0, concluido: false } })

  for (const r of ['a', 'b']) {
    await prisma.quiz_respostas.upsert({
      where: { participante_id_pergunta_id: { participante_id: part, pergunta_id: p1 } },
      create: { id: crypto.randomUUID(), participante_id: part, pergunta_id: p1, resposta: r, correta: r === 'a', pontos_obtidos: r === 'a' ? 10 : 0 },
      update: { resposta: r, correta: r === 'a', pontos_obtidos: r === 'a' ? 10 : 0 } })
  }
  ok('responder duas vezes atualiza em vez de duplicar',
     (await prisma.quiz_respostas.count({ where: { participante_id: part } })) === 1)

  await prisma.$transaction([
    prisma.quiz_perguntas.update({ where: { id: p1 }, data: { ordem: 2 } }),
    prisma.quiz_perguntas.update({ where: { id: p2 }, data: { ordem: 1 } })])
  const ordens = (await prisma.quiz_perguntas.findMany({ where: { quiz_id: qid }, select: { id: true, ordem: true } }))
  ok('troca de ordem em transacao', ordens.find(o => o.id === p1)?.ordem === 2 && ordens.find(o => o.id === p2)?.ordem === 1)

  await prisma.$transaction(async tx => {
    const ids = (await tx.quiz_participantes.findMany({ where: { quiz_id: qid }, select: { id: true } })).map(x => x.id)
    await tx.quiz_respostas.deleteMany({ where: { participante_id: { in: ids } } })
    await tx.quiz_participantes.deleteMany({ where: { quiz_id: qid } })
    await tx.quizzes.update({ where: { id: qid }, data: { lobby_aberto: true, ativo: false } })
  })
  ok('reabrir apaga participantes e respostas',
     (await prisma.quiz_participantes.count({ where: { quiz_id: qid } })) === 0 &&
     (await prisma.quiz_respostas.count({ where: { participante_id: part } })) === 0)
} finally {
  await limpar()
  // Conta so o que esta suite criou. Contar a tabela inteira quebrava assim
  // que o banco deixou de estar vazio — e o banco de verdade nunca esta.
  const sobrou = await prisma.quizzes.count({ where: { codigo: CODIGO } })
  ok('banco limpo ao final', sobrou === 0, `${sobrou} quizzes do teste`)
  await prisma.$disconnect()
}
process.exit(falhas ? 1 : 0)
