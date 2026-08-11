/**
 * Teste do log de auditoria — foco na armadilha do JSON.
 * `detalhes` era jsonb e virou longtext; o Prisma tipa como String, entao a
 * serializacao tem que ser explicita, e o filtro por campo interno precisa de
 * JSON_EXTRACT em vez do operador ->> do Postgres.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
const u = new URL(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter: new PrismaMariaDb({ host: u.hostname, port: 3306,
  database: u.pathname.slice(1), user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password), connectionLimit: 2 }) })

let falhas = 0
const ok = (r, c, x = '') => { console.log(`${c ? 'ok   ' : 'FALHA'} ${r}${x ? ' — ' + x : ''}`); if (!c) falhas++ }
const IP = '203.0.113.99'

try {
  await prisma.log_atividades.deleteMany({ where: { ip: IP } })

  await prisma.log_atividades.create({ data: {
    acao: 'login_falha', ip: IP,
    detalhes: JSON.stringify({ motivo: 'senha_incorreta', identificador: 'cpf ***4321' }) } })
  await prisma.log_atividades.create({ data: {
    acao: 'login_falha', ip: IP, detalhes: JSON.stringify({ motivo: 'nao_encontrado' }) } })

  const lido = await prisma.log_atividades.findFirst({ where: { ip: IP, acao: 'login_falha' } })
  const det = JSON.parse(lido.detalhes)
  ok('detalhes grava e le como JSON', det.motivo === 'senha_incorreta' || det.motivo === 'nao_encontrado', det.motivo)

  // filtro por campo interno do JSON — era ->> no Postgres
  const r = await prisma.$queryRaw`
    SELECT COUNT(*) AS total FROM log_atividades
    WHERE acao = 'login_falha' AND ip = ${IP}
      AND JSON_UNQUOTE(JSON_EXTRACT(detalhes, '$.motivo')) = 'senha_incorreta'`
  ok('filtro dentro do JSON funciona com JSON_EXTRACT', Number(r[0].total) === 1, `${r[0].total} linha(s)`)

  // objeto passado direto (o erro que a camada evita)
  let recusou = false
  try {
    await prisma.log_atividades.create({ data: { acao: 'login_falha', ip: IP, detalhes: { motivo: 'x' } } })
  } catch { recusou = true }
  ok('objeto sem serializar e recusado, nao gravado torto', recusou)

  ok('contagem por IP para rate limit',
     (await prisma.log_atividades.count({ where: { acao: 'login_falha', ip: IP } })) === 2)
} finally {
  await prisma.log_atividades.deleteMany({ where: { ip: IP } })
  ok('banco limpo ao final', (await prisma.log_atividades.count({ where: { ip: IP } })) === 0)
  await prisma.$disconnect()
}
process.exit(falhas ? 1 : 0)
