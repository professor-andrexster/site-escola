/**
 * Teste da circulacao da biblioteca contra o MariaDB.
 * O foco e o que a transacao protege: emprestimo e devolucao mexem em
 * varias tabelas e nao podem terminar pela metade.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const u = new URL(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter: new PrismaMariaDb({ host: u.hostname, port: 3306,
  database: u.pathname.slice(1), user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password), connectionLimit: 2 }) })

const TOMBO = 'TST-BIB-001'
let falhas = 0
const ok = (r, c, x = '') => { console.log(`${c ? 'ok   ' : 'FALHA'} ${r}${x ? ' — ' + x : ''}`); if (!c) falhas++ }

const oid = crypto.randomUUID(), eid = crypto.randomUUID()
const l1 = crypto.randomUUID(), l2 = crypto.randomUUID()

async function limpar() {
  const ex = await prisma.biblioteca_exemplares.findMany({ where: { tombo: TOMBO }, select: { id: true, obra_id: true } })
  for (const e of ex) {
    await prisma.biblioteca_movimentacoes.deleteMany({ where: { exemplar_id: e.id } })
    await prisma.biblioteca_emprestimos.deleteMany({ where: { exemplar_id: e.id } })
    await prisma.biblioteca_reservas.deleteMany({ where: { obra_id: e.obra_id } })
    await prisma.biblioteca_exemplares.delete({ where: { id: e.id } })
    await prisma.biblioteca_obras.deleteMany({ where: { id: e.obra_id } })
  }
  await prisma.biblioteca_leitores.deleteMany({ where: { matricula: { in: ['TSTL1', 'TSTL2'] } } })
}

try {
  await limpar()
  await prisma.biblioteca_obras.create({ data: { id: oid, titulo: 'Obra Teste', palavras_chave: JSON.stringify(['teste', 'migracao']) } })
  await prisma.biblioteca_exemplares.create({ data: { id: eid, obra_id: oid, tombo: TOMBO, situacao: 'disponivel', data_entrada: new Date() } })
  await prisma.biblioteca_leitores.create({ data: { id: l1, nome_completo: 'Leitor Um', matricula: 'TSTL1', tipo_leitor: 'aluno', situacao: 'ativo' } })
  await prisma.biblioteca_leitores.create({ data: { id: l2, nome_completo: 'Leitor Dois', matricula: 'TSTL2', tipo_leitor: 'aluno', situacao: 'ativo' } })

  const obraLida = await prisma.biblioteca_obras.findUnique({ where: { id: oid } })
  const lista = JSON.parse(obraLida?.palavras_chave ?? '[]')
  ok('coluna que era text[] volta como JSON serializado',
     Array.isArray(lista) && lista.length === 2, obraLida?.palavras_chave)

  // --- emprestimo em transacao
  const prevista = new Date(Date.now() - 86400000) // ontem: forca o atraso
  const emp = await prisma.$transaction(async tx => {
    const e = await tx.biblioteca_emprestimos.create({ data: {
      exemplar_id: eid, leitor_id: l1, data_emprestimo: new Date(), data_prevista: prevista,
      situacao: 'em_andamento', renovacoes_feitas: 0 } })
    await tx.biblioteca_exemplares.update({ where: { id: eid }, data: { situacao: 'emprestado' } })
    await tx.biblioteca_movimentacoes.create({ data: {
      exemplar_id: eid, situacao_anterior: 'disponivel', situacao_nova: 'emprestado', motivo: 'emprestimo' } })
    return e
  })
  const exDepois = await prisma.biblioteca_exemplares.findUnique({ where: { id: eid }, select: { situacao: true } })
  ok('emprestimo marca o exemplar como emprestado', exDepois?.situacao === 'emprestado')
  ok('emprestimo registra a movimentacao', (await prisma.biblioteca_movimentacoes.count({ where: { exemplar_id: eid } })) === 1)

  // --- reserva na fila, para a devolucao ter o que liberar
  await prisma.biblioteca_reservas.create({ data: {
    obra_id: oid, leitor_id: l2, data_reserva: new Date(), posicao_fila: 1, situacao: 'aguardando',
    validade: new Date(Date.now() + 7 * 86400000) } })

  // --- devolucao em transacao
  const resultado = await prisma.$transaction(async tx => {
    const e = await tx.biblioteca_emprestimos.findUnique({ where: { id: emp.id },
      include: { biblioteca_exemplares: { select: { obra_id: true } } } })
    const atrasado = !!e.data_prevista && new Date() > e.data_prevista
    await tx.biblioteca_emprestimos.update({ where: { id: emp.id }, data: {
      situacao: atrasado ? 'devolvido_com_atraso' : 'devolvido', data_devolucao: new Date() } })
    const proxima = await tx.biblioteca_reservas.findFirst({
      where: { obra_id: e.biblioteca_exemplares.obra_id, situacao: 'aguardando' }, orderBy: { posicao_fila: 'asc' } })
    if (proxima) await tx.biblioteca_reservas.update({ where: { id: proxima.id }, data: { situacao: 'disponivel' } })
    const nova = proxima ? 'reservado' : 'disponivel'
    await tx.biblioteca_exemplares.update({ where: { id: eid }, data: { situacao: nova } })
    await tx.biblioteca_movimentacoes.create({ data: {
      exemplar_id: eid, situacao_anterior: 'emprestado', situacao_nova: nova,
      motivo: atrasado ? 'devolucao_com_atraso' : 'devolucao' } })
    return { atrasado, reservaLiberada: !!proxima }
  })

  ok('devolucao apos o prazo marca atraso', resultado.atrasado === true)
  ok('devolucao libera a proxima da fila', resultado.reservaLiberada === true)
  const exFinal = await prisma.biblioteca_exemplares.findUnique({ where: { id: eid }, select: { situacao: true } })
  ok('com reserva na fila o exemplar vai para reservado, nao disponivel',
     exFinal?.situacao === 'reservado', exFinal?.situacao)
  const res = await prisma.biblioteca_reservas.findFirst({ where: { obra_id: oid } })
  ok('a reserva sai de aguardando', res?.situacao === 'disponivel', res?.situacao)
  ok('historico de movimentacao completo', (await prisma.biblioteca_movimentacoes.count({ where: { exemplar_id: eid } })) === 2)

  // --- transacao que falha nao deixa rastro
  const antes = await prisma.biblioteca_movimentacoes.count({ where: { exemplar_id: eid } })
  try {
    await prisma.$transaction(async tx => {
      await tx.biblioteca_movimentacoes.create({ data: {
        exemplar_id: eid, situacao_anterior: 'reservado', situacao_nova: 'disponivel', motivo: 'teste' } })
      throw new Error('falha proposital no meio da transacao')
    })
  } catch { /* esperado */ }
  ok('transacao que falha no meio nao grava nada',
     (await prisma.biblioteca_movimentacoes.count({ where: { exemplar_id: eid } })) === antes)
} finally {
  await limpar()
  ok('banco limpo ao final', (await prisma.biblioteca_exemplares.count()) === 0)
  await prisma.$disconnect()
}
process.exit(falhas ? 1 : 0)
