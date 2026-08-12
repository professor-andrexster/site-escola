/** Teste da camada lib/db/cursos.ts contra o MariaDB. Limpa o proprio residuo. */
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const u = new URL(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter: new PrismaMariaDb({ host: u.hostname, port: 3306,
  database: u.pathname.slice(1), user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password), connectionLimit: 2 }) })

const SLUG = 'curso-teste-auto'
const cid = crypto.randomUUID(), a1 = crypto.randomUUID(), a2 = crypto.randomUUID()
const uid = crypto.randomUUID()
let falhas = 0
const ok = (r, c, x = '') => { console.log(`${c ? 'ok   ' : 'FALHA'} ${r}${x ? ' — ' + x : ''}`); if (!c) falhas++ }

async function limpar() {
  const ids = (await prisma.cursos.findMany({ where: { slug: SLUG }, select: { id: true } })).map(c => c.id)
  if (ids.length) {
    await prisma.progresso_aulas.deleteMany({ where: { curso_id: { in: ids } } })
    await prisma.aulas.deleteMany({ where: { curso_id: { in: ids } } })
    await prisma.cursos.deleteMany({ where: { id: { in: ids } } })
  }
  await prisma.usuarios.deleteMany({ where: { email: 'curso-teste@escola.local' } })
}

try {
  await limpar()
  await prisma.usuarios.create({ data: { id: uid, email: 'curso-teste@escola.local' } })
  await prisma.cursos.create({ data: { id: cid, titulo: 'Curso Teste', slug: SLUG, publicado: true, ordem: 1 } })
  await prisma.aulas.createMany({ data: [
    { id: a1, curso_id: cid, titulo: 'Aula 1', slug: 'aula-1', ordem: 1, publicado: true, duracao_estimada_min: 30 },
    { id: a2, curso_id: cid, titulo: 'Aula 2', slug: 'aula-2', ordem: 2, publicado: true, duracao_estimada_min: 45 }] })

  const soma = await prisma.aulas.aggregate({ where: { curso_id: cid, publicado: true }, _sum: { duracao_estimada_min: true } })
  ok('duracao total soma as aulas publicadas', soma._sum.duracao_estimada_min === 75, `${soma._sum.duracao_estimada_min} min`)

  // progresso: marcar duas vezes nao duplica
  for (const c of [true, false]) {
    await prisma.progresso_aulas.upsert({
      where: { user_id_aula_id: { user_id: uid, aula_id: a1 } },
      create: { user_id: uid, curso_id: cid, aula_id: a1, concluida: c, concluida_em: c ? new Date() : null },
      update: { concluida: c, concluida_em: c ? new Date() : null } })
  }
  const prog = await prisma.progresso_aulas.findMany({ where: { user_id: uid, aula_id: a1 } })
  ok('progresso registra uma linha por aula', prog.length === 1, `${prog.length} linha(s)`)
  ok('desmarcar limpa a data de conclusao', prog[0]?.concluida === false && prog[0]?.concluida_em === null)

  await prisma.$transaction([
    prisma.aulas.update({ where: { id: a1 }, data: { ordem: 2 } }),
    prisma.aulas.update({ where: { id: a2 }, data: { ordem: 1 } })])
  const ord = await prisma.aulas.findMany({ where: { curso_id: cid }, select: { id: true, ordem: true } })
  ok('troca de ordem de aulas em transacao',
     ord.find(o => o.id === a1)?.ordem === 2 && ord.find(o => o.id === a2)?.ordem === 1)

  // remocao em cascata
  await prisma.$transaction(async tx => {
    await tx.progresso_aulas.deleteMany({ where: { curso_id: cid } })
    await tx.aulas.deleteMany({ where: { curso_id: cid } })
    await tx.cursos.delete({ where: { id: cid } })
  })
  ok('remocao em cascata nao deixa aula nem progresso orfaos',
     (await prisma.aulas.count({ where: { curso_id: cid } })) === 0 &&
     (await prisma.progresso_aulas.count({ where: { curso_id: cid } })) === 0)
} finally {
  await limpar()
  // Escopado ao curso desta suite: o banco de verdade tem cursos reais.
  ok('banco limpo ao final', (await prisma.cursos.count({ where: { id: cid } })) === 0)
  await prisma.$disconnect()
}
process.exit(falhas ? 1 : 0)
