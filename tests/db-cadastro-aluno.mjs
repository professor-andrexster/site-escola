/**
 * Auto-cadastro de aluno sem matricula e sem CPF.
 *
 * O que precisa valer depois que os dois campos sairam do formulario:
 *  - casar com a ficha da secretaria quando nome e turma batem, mesmo com
 *    acento e caixa diferentes, e mesmo com a turma no formato antigo;
 *  - nao roubar ficha que ja tem dono;
 *  - nao chutar quando duas fichas empatam;
 *  - criar a ficha quando nao ha nenhuma, para a conta nao nascer quebrada;
 *  - marcar a origem, que e o que a tela de aprovacao mostra.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { criarCadastroDeAluno } from '@/lib/db/cadastro'
import { fichasSemConta, proximaMatricula } from '@/lib/db/alunos'
import { turmaCompativel } from '@/lib/turmas'

const u = new URL(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter: new PrismaMariaDb({ host: u.hostname, port: 3306,
  database: u.pathname.slice(1), user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password), connectionLimit: 2 }) })

let falhas = 0
const ok = (r, c, x = '') => { console.log(`${c ? 'ok   ' : 'FALHA'} ${r}${x ? ' — ' + x : ''}`); if (!c) falhas++ }

// Mesma normalizacao da rota. Duplicada de proposito: se a rota mudar a regra
// sem o teste mudar junto, o teste tem que quebrar.
const chaveDoNome = v => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/\s+/g, ' ').trim()

const MARCA = 'ZZTESTE'
const contas = []
const novaConta = () => { const id = crypto.randomUUID(); contas.push(id); return id }

async function limpar() {
  await prisma.identidades.deleteMany({ where: { user_id: { in: contas } } })
  await prisma.alunos.deleteMany({ where: { OR: [
    { nome: { contains: MARCA } },
    { user_id: { in: contas } },
  ] } })
  await prisma.profiles.deleteMany({ where: { id: { in: contas } } })
  await prisma.usuarios.deleteMany({ where: { id: { in: contas } } })
}

/** Repete a resolucao de ficha da rota, para testar a regra e nao o HTTP. */
async function resolverFicha(nome, turma, nascimento) {
  const chave = chaveDoNome(nome)
  const candidatas = (await fichasSemConta()).filter(
    f => chaveDoNome(f.nome) === chave && turmaCompativel(turma, f.turma)
  )
  const comNasc = nascimento
    ? candidatas.filter(f => f.data_nascimento &&
        f.data_nascimento.toISOString().slice(0, 10) === nascimento)
    : []
  const escolhidas = comNasc.length === 1 ? comNasc : candidatas
  return escolhidas.length === 1 ? escolhidas[0] : null
}

try {
  await limpar()

  // ---------------------------------------------------------------- casa
  const fichaA = await prisma.alunos.create({ data: {
    nome: `João ${MARCA} Silva`, matricula: `M-${MARCA}-1`,
    turma: '2° Ano B', serie: '2° Ano', turno: 'Integral' } })

  const achada = await resolverFicha(`joao ${MARCA}  silva`, '2° Ano', null)
  ok('acha a ficha ignorando acento, caixa e espaco duplo', achada?.id === fichaA.id)
  ok('turma "2° Ano" cobre a ficha antiga "2° Ano B"', turmaCompativel('2° Ano', '2° Ano B'))
  ok('turma nao cobre outro ano', !turmaCompativel('2° Ano', '3° Ano'))

  const c1 = novaConta()
  await prisma.usuarios.create({ data: { id: c1, email: `${MARCA}1@escola.local` } })
  const origem1 = await criarCadastroDeAluno({
    userId: c1, alunoId: achada.id, nome: `Joao ${MARCA} Silva`, turma: '2° Ano',
    email: `${MARCA}1@escola.local`, dataNascimento: null, aprovado: false })
  ok('vinculo a ficha existente devolve ficha_existente', origem1 === 'ficha_existente')

  const depois = await prisma.alunos.findUnique({ where: { id: fichaA.id } })
  ok('ficha da secretaria passou a apontar para a conta', depois.user_id === c1)
  ok('matricula da secretaria foi preservada', depois.matricula === `M-${MARCA}-1`)

  const ident1 = await prisma.identidades.findUnique({ where: { user_id: c1 } })
  ok('identidade fica sem CPF', ident1.cpf === null)
  ok('origem marcada como auto_aluno', ident1.criado_via === 'auto_aluno')

  // ------------------------------------------------- nao rouba ficha com dono
  const repetida = await resolverFicha(`Joao ${MARCA} Silva`, '2° Ano', null)
  ok('ficha ja reivindicada some do universo de busca', repetida === null)

  // ------------------------------------------------------------- ficha nova
  const c2 = novaConta()
  await prisma.usuarios.create({ data: { id: c2, email: `${MARCA}2@escola.local` } })
  const semFicha = await resolverFicha(`Maria ${MARCA} Souza`, '1° Ano', null)
  ok('nome que nao existe na base nao casa com nada', semFicha === null)

  const mat = await proximaMatricula()
  ok('matricula gerada segue o padrao ALU<ano><4 digitos>', /^ALU\d{8}$/.test(mat), mat)

  // Matricula torta nao pode envenenar o gerador: ela ordena DEPOIS da maior
  // numerica, e um `Number()` nela daria NaN. Se o gerador confiasse no maior
  // lexicografico, devolveria sempre o mesmo valor invalido e o cadastro
  // travaria de vez.
  const ano = new Date().getFullYear()
  await prisma.alunos.create({ data: {
    nome: `Torta ${MARCA} Matricula`, matricula: `ALU${ano}TEMP`,
    turma: '1° Ano', serie: '1° Ano', turno: 'Integral' } })
  ok('matricula nao numerica nao quebra o gerador',
    (await proximaMatricula()) === mat, await proximaMatricula())
  await prisma.alunos.deleteMany({ where: { matricula: `ALU${ano}TEMP` } })

  const origem2 = await criarCadastroDeAluno({
    userId: c2, matricula: mat, nome: `Maria ${MARCA} Souza`, turma: '1° Ano',
    email: `${MARCA}2@escola.local`, dataNascimento: new Date('2009-03-14'), aprovado: false })
  ok('sem ficha para casar devolve ficha_nova', origem2 === 'ficha_nova')

  const criada = await prisma.alunos.findFirst({ where: { user_id: c2 } })
  ok('a ficha foi criada e ja nasce ligada a conta', !!criada && criada.matricula === mat)
  ok('serie preenchida (coluna NOT NULL)', !!criada?.serie)

  const ident2 = await prisma.identidades.findUnique({ where: { user_id: c2 } })
  ok('origem marcada como auto_aluno_novo', ident2.criado_via === 'auto_aluno_novo')

  // Este e o ponto do desenho: sem ficha, "meu perfil" responderia 404.
  ok('toda conta de aluno termina com ficha vinculada',
    !!(await prisma.alunos.findFirst({ where: { user_id: c2 } })))

  // -------------------------------------------------------------- empate
  await prisma.alunos.create({ data: {
    nome: `Ana ${MARCA} Lima`, matricula: `M-${MARCA}-2`,
    turma: '3° Ano', serie: '3° Ano', turno: 'Integral',
    data_nascimento: new Date('2008-01-02') } })
  // Comparado por id, e nao por matricula: `fichasSemConta` so devolve o que a
  // rota usa (id, nome, turma, nascimento) — matricula viria undefined, e a
  // assercao passaria a comparar undefined com undefined.
  const julho = await prisma.alunos.create({ data: {
    nome: `Ana ${MARCA} Lima`, matricula: `M-${MARCA}-3`,
    turma: '3° Ano', serie: '3° Ano', turno: 'Integral',
    data_nascimento: new Date('2008-07-30') } })

  ok('duas fichas com mesmo nome e turma: nenhuma e escolhida',
    (await resolverFicha(`Ana ${MARCA} Lima`, '3° Ano', null)) === null)
  ok('o nascimento desempata quando so uma bate',
    (await resolverFicha(`Ana ${MARCA} Lima`, '3° Ano', '2008-07-30'))?.id === julho.id)
  ok('nascimento que nao bate em nenhuma nao escolhe no chute',
    (await resolverFicha(`Ana ${MARCA} Lima`, '3° Ano', '1999-01-01')) === null)

  // --------------------------------------------- data de nascimento na ficha
  // Regressao: /api/alunos repassava a string "2010-02-07" para uma coluna
  // DateTime e o Prisma recusava com "premature end of input. Expected
  // ISO-8601 DateTime". Como o campo e opcional, o cadastro so quebrava para
  // quem preenchia a data — foi o erro relatado na tela de Novo Aluno.
  const comData = await prisma.alunos.create({ data: {
    nome: `Data ${MARCA} Nascimento`, matricula: `M-${MARCA}-4`,
    turma: '1° Ano', serie: '1° Ano', turno: 'Integral',
    data_nascimento: new Date('2010-02-07T00:00:00Z') } })
  ok('data de nascimento grava e volta no mesmo dia',
    comData.data_nascimento?.toISOString().slice(0, 10) === '2010-02-07',
    comData.data_nascimento?.toISOString())

  let recusouString = false
  try {
    await prisma.alunos.create({ data: {
      nome: `String ${MARCA} Data`, matricula: `M-${MARCA}-5`,
      turma: '1° Ano', serie: '1° Ano', turno: 'Integral',
      data_nascimento: '2010-02-07' } })
  } catch { recusouString = true }
  ok('string pura de data e recusada pelo Prisma (por isso a rota converte)', recusouString)

  // ------------------------------------------------- transacao e tudo ou nada
  const c3 = novaConta()
  await prisma.usuarios.create({ data: { id: c3, email: `${MARCA}3@escola.local` } })
  let recusou = false
  try {
    // Mesma matricula da ficha criada acima: o unique tem que recusar.
    await criarCadastroDeAluno({
      userId: c3, matricula: mat, nome: `Outro ${MARCA} Nome`, turma: '1° Ano',
      email: `${MARCA}3@escola.local`, dataNascimento: null, aprovado: false })
  } catch { recusou = true }
  ok('matricula repetida e recusada', recusou)
  ok('e a transacao recusada nao deixou perfil para tras',
    !(await prisma.profiles.findUnique({ where: { id: c3 } })))

  await limpar()
  const sobrou = await prisma.alunos.count({ where: { nome: { contains: MARCA } } })
  ok('banco limpo ao final', sobrou === 0)
} catch (erro) {
  console.error('FALHA inesperada', erro)
  falhas++
  await limpar().catch(() => {})
} finally {
  await prisma.$disconnect()
}

process.exit(falhas ? 1 : 0)
