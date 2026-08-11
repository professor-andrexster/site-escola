/**
 * Teste do vinculo de cadastro. O que importa aqui e o tudo-ou-nada:
 * profiles, identidades e alunos.user_id entram juntos ou nao entram.
 * No codigo antigo eram tres escritas com desfazer manual em degraus.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
const u = new URL(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter: new PrismaMariaDb({ host: u.hostname, port: 3306,
  database: u.pathname.slice(1), user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password), connectionLimit: 2 }) })

let falhas = 0
const ok = (r, c, x = '') => { console.log(`${c ? 'ok   ' : 'FALHA'} ${r}${x ? ' — ' + x : ''}`); if (!c) falhas++ }
const MAT = 'ALU-TST-CAD'
const CPF = '00000000191'
const u1 = crypto.randomUUID(), u2 = crypto.randomUUID(), aid = crypto.randomUUID()

async function limpar() {
  await prisma.identidades.deleteMany({ where: { user_id: { in: [u1, u2] } } })
  await prisma.alunos.deleteMany({ where: { matricula: MAT } })
  await prisma.profiles.deleteMany({ where: { id: { in: [u1, u2] } } })
  await prisma.usuarios.deleteMany({ where: { id: { in: [u1, u2] } } })
}

try {
  await limpar()
  await prisma.usuarios.create({ data: { id: u1, email: 'cad1@escola.local' } })
  await prisma.usuarios.create({ data: { id: u2, email: 'cad2@escola.local' } })
  await prisma.alunos.create({ data: { id: aid, nome: 'Cad Teste', matricula: MAT, turma: '1° Ano', serie: '1° Ano', turno: 'Integral' } })

  // caminho feliz
  await prisma.$transaction(async tx => {
    await tx.profiles.create({ data: { id: u1, nome_completo: 'Cad Teste', role: 'aluno', turma: '1° Ano', aprovado: false, email: 'cad1@escola.local' } })
    await tx.identidades.create({ data: { user_id: u1, cpf: CPF, data_nascimento: new Date('2010-05-01'), criado_via: 'auto_aluno' } })
    await tx.alunos.update({ where: { id: aid }, data: { user_id: u1 } })
  })
  const ficha = await prisma.alunos.findUnique({ where: { id: aid } })
  ok('cadastro liga ficha, perfil e identidade', ficha?.user_id === u1)

  // CPF duplicado: a transacao inteira tem que voltar atras
  let recusou = false
  try {
    await prisma.$transaction(async tx => {
      await tx.profiles.create({ data: { id: u2, nome_completo: 'Outro', role: 'aluno', turma: '1° Ano', aprovado: false, email: 'cad2@escola.local' } })
      await tx.identidades.create({ data: { user_id: u2, cpf: CPF, criado_via: 'auto_aluno' } })
    })
  } catch (e) { recusou = e.code === 'P2002' }
  ok('CPF ja usado e recusado com P2002', recusou)
  ok('e o perfil da tentativa recusada NAO ficou no banco',
     (await prisma.profiles.count({ where: { id: u2 } })) === 0)
} finally {
  await limpar()
  ok('banco limpo ao final', (await prisma.usuarios.count({ where: { id: { in: [u1, u2] } } })) === 0)
  await prisma.$disconnect()
}
process.exit(falhas ? 1 : 0)
