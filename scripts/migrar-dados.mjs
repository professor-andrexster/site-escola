/**
 * Copia os dados do Supabase (PostgreSQL) para o MariaDB.
 *
 *   PGURL='postgresql://...' DATABASE_URL='mysql://...' node scripts/migrar-dados.mjs [--ensaio]
 *
 * Lê pelo `psql` (que já está instalado e lida com o TLS do pooler) e grava
 * pelo Prisma, que conhece o schema e converte os tipos.
 *
 * `--ensaio` lê tudo e mostra o que faria, sem gravar nada.
 *
 * Ordem das tabelas: as que são referidas vêm antes das que referem. Não é
 * decorativo — sem isso a FK recusa a linha filha.
 */
import { execFileSync } from 'node:child_process'
import { prisma } from '../lib/db.ts'

const ENSAIO = process.argv.includes('--ensaio')
const PGURL = process.env.PGURL
if (!PGURL) {
  console.error('Defina PGURL com a string de conexão de leitura do Supabase.')
  process.exit(2)
}

/**
 * `usuarios` não está nesta lista: ela não existe no Postgres. É `auth.users`,
 * que o papel de leitura não alcança. Ver `montarContas()` no fim.
 */
const ORDEM = [
  'trilhas',
  'profiles',
  'alunos',
  'identidades',
  'noticias',
  'noticias_log',
  'cursos',
  'aulas',
  'progresso_aulas',
  'curso_desafios',
  'curso_prova_perguntas',
  'certificados',
  'quizzes',
  'quiz_perguntas',
  'quiz_participantes',
  'quiz_respostas',
  'ideias',
  'ideia_votos',
  'ideia_comentarios',
  'projetos',
  'desafios',
  'desafio_fases',
  'desafio_papeis',
  'equipes',
  'equipe_membros',
  'entregas',
  'testes_vocacionais',
  'perfis_vocacionais',
  'paginas_conteudo',
  'configuracoes_site',
  'leads',
  'log_atividades',
  'convites_usuario',
  'biblioteca_categorias',
  'biblioteca_autores',
  'biblioteca_editoras',
  'biblioteca_obras',
  'biblioteca_exemplares',
  'biblioteca_leitores',
  'biblioteca_emprestimos',
  'biblioteca_reservas',
  'biblioteca_movimentacoes',
  'biblioteca_auditoria',
  'biblioteca_calendario',
  'biblioteca_configuracoes',
]

const ISO = /^\d{4}-\d{2}-\d{2}(T| )\d{2}:\d{2}:\d{2}/
const SO_DATA = /^\d{4}-\d{2}-\d{2}$/

/** Descobre, pelo Prisma, quais colunas são data e quais guardam JSON. */
function formaDaTabela(tabela) {
  const modelo = prisma._runtimeDataModel?.models?.[tabela]
  if (!modelo) return null
  const datas = new Set()
  const textos = new Set()
  for (const campo of modelo.fields) {
    if (campo.kind !== 'scalar') continue
    if (campo.type === 'DateTime') datas.add(campo.dbName ?? campo.name)
    if (campo.type === 'String') textos.add(campo.dbName ?? campo.name)
  }
  return { datas, textos, colunas: new Set(modelo.fields.filter(c => c.kind === 'scalar').map(c => c.dbName ?? c.name)) }
}

/**
 * A tabela inteira num array JSON só.
 *
 * Não use `COPY ... TO STDOUT`: ele aplica o escape de texto do Postgres por
 * cima do JSON, e qualquer conteúdo com quebra de linha volta impossível de
 * parsear. Foi o que aconteceu com noticias, cursos, aulas, curso_desafios e
 * quiz_perguntas — as cinco tabelas com texto longo.
 *
 * `json_agg` com `-A -t` sai cru e já é JSON válido.
 */
function ler(tabela) {
  const sql = `SELECT coalesce(json_agg(t)::text, '[]') FROM public.${tabela} t`
  const saida = execFileSync(
    'psql',
    [PGURL, '-X', '--no-psqlrc', '-q', '-t', '-A', '-v', 'ON_ERROR_STOP=1', '-c', sql],
    { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 }
  )
  return JSON.parse(saida.trim() || '[]')
}

/**
 * Converte uma linha do Postgres para o que o Prisma espera no MariaDB.
 *
 * As três diferenças que importam: data vem como texto ISO e precisa virar
 * Date; array e objeto (era text[] e jsonb) viram texto JSON, porque o MySQL
 * não tem array; e coluna que não existe mais é descartada em silêncio — o
 * schema do Supabase tem resíduo que a conversão já removeu.
 */
function converter(linha, forma) {
  const saida = {}
  for (const [coluna, valor] of Object.entries(linha)) {
    if (!forma.colunas.has(coluna)) continue
    if (valor === null || valor === undefined) { saida[coluna] = null; continue }

    if (forma.datas.has(coluna)) {
      saida[coluna] = typeof valor === 'string' ? new Date(valor) : valor
    } else if (typeof valor === 'object') {
      saida[coluna] = JSON.stringify(valor)
    } else if (forma.textos.has(coluna) && typeof valor === 'string'
               && (ISO.test(valor) || SO_DATA.test(valor))) {
      saida[coluna] = valor
    } else {
      saida[coluna] = valor
    }
  }
  return saida
}

/**
 * `usuarios` sai de `profiles`, porque `auth.users` não é legível pelo papel
 * de diagnóstico.
 *
 * Consequência: `encrypted_password` fica nulo e as 37 contas precisam
 * redefinir a senha na primeira entrada. Para evitar isso, alguém com acesso
 * ao painel precisa exportar `auth.users` (id, email, encrypted_password) e
 * passar o arquivo em CONTAS_JSON.
 */
async function montarContas(perfis) {
  const arquivo = process.env.CONTAS_JSON
  if (arquivo) {
    const { readFileSync } = await import('node:fs')
    const contas = JSON.parse(readFileSync(arquivo, 'utf8'))
    console.log(`  usuarios: ${contas.length} conta(s) do arquivo, com hash de senha`)
    return contas.map(c => ({
      id: c.id,
      email: c.email,
      encrypted_password: c.encrypted_password ?? null,
      email_confirmed_at: c.email_confirmed_at ? new Date(c.email_confirmed_at) : null,
      last_sign_in_at: c.last_sign_in_at ? new Date(c.last_sign_in_at) : null,
      banned_until: c.banned_until ? new Date(c.banned_until) : null,
      created_at: c.created_at ? new Date(c.created_at) : new Date(),
    }))
  }

  console.log(
    `  usuarios: ${perfis.length} conta(s) derivada(s) de profiles — SEM senha.\n` +
    '            Todo mundo vai precisar redefinir. Para evitar, exporte\n' +
    '            auth.users e passe o arquivo em CONTAS_JSON.'
  )
  return perfis.map(p => ({
    id: p.id,
    email: p.email,
    encrypted_password: null,
    email_confirmed_at: new Date(),
    created_at: p.created_at ? new Date(p.created_at) : new Date(),
  }))
}

/**
 * Linhas que o Postgres aceitava e o MariaDB vai recusar.
 *
 * A collation daqui (utf8mb4_unicode_ci) compara ignorando maiúsculas; a do
 * Postgres não. Então duas linhas que só diferem na caixa passavam por dois
 * registros lá e viram colisão de índice único aqui.
 *
 * Sem esta checagem o `skipDuplicates` engole a segunda linha em silêncio, e
 * a perda só aparece na contagem final — ou pior, quando alguém procura o
 * próprio cadastro e não acha.
 */
function colisoesPorCaixa(linhas, coluna) {
  const porChave = new Map()
  for (const linha of linhas) {
    const valor = linha[coluna]
    if (valor == null) continue
    const chave = String(valor).toLowerCase()
    if (!porChave.has(chave)) porChave.set(chave, [])
    porChave.get(chave).push(linha)
  }
  return [...porChave.values()].filter(grupo => grupo.length > 1)
}

/** Colunas com índice único de texto, onde a diferença de collation morde. */
const UNICOS_DE_TEXTO = {
  alunos: 'matricula',
  profiles: 'email',
  noticias: 'slug',
  cursos: 'slug',
  quizzes: 'codigo',
  identidades: 'cpf',
  biblioteca_obras: 'isbn',
  paginas_conteudo: 'pagina',
}

let total = 0
let problemas = 0
let colisoes = 0

try {
  if (!ENSAIO) await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0')

  const perfis = ler('profiles')
  const contas = await montarContas(perfis)
  if (!ENSAIO && contas.length) {
    await prisma.usuarios.createMany({ data: contas, skipDuplicates: true })
  }
  total += contas.length

  for (const tabela of ORDEM) {
    const forma = formaDaTabela(tabela)
    if (!forma) { console.log(`  ${tabela}: não existe no MariaDB, pulada`); continue }

    let linhas
    try {
      linhas = tabela === 'profiles' ? perfis : ler(tabela)
    } catch (erro) {
      const msg = String(erro.stderr ?? erro.message).split('\n')[0]
      console.log(`  ${tabela}: não lida — ${msg}`)
      problemas++
      continue
    }
    if (!linhas.length) { console.log(`  ${tabela}: vazia`); continue }

    const coluna = UNICOS_DE_TEXTO[tabela]
    if (coluna) {
      for (const grupo of colisoesPorCaixa(linhas, coluna)) {
        colisoes++
        console.log(
          `  !! ${tabela}.${coluna}='${grupo[0][coluna]}' repetido em ${grupo.length} linhas ` +
          `que só diferem na caixa:`
        )
        for (const linha of grupo) {
          console.log(`       ${linha.id}  ${linha[coluna]}  ${linha.nome ?? linha.titulo ?? ''}`)
        }
        console.log('       O MariaDB só vai aceitar UMA. Decida qual antes da virada.')
      }
    }

    const dados = linhas.map(l => converter(l, forma))
    if (!ENSAIO) {
      await prisma[tabela].createMany({ data: dados, skipDuplicates: true })
    }
    console.log(`  ${tabela}: ${dados.length}`)
    total += dados.length
  }
} finally {
  if (!ENSAIO) await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1')
  await prisma.$disconnect()
}

console.log(
  `\n${ENSAIO ? '[ensaio] ' : ''}${total} linha(s)` +
  `${problemas ? ` — ${problemas} tabela(s) com problema` : ''}` +
  `${colisoes ? ` — ${colisoes} colisão(ões) de caixa: linhas FORAM PERDIDAS` : ''}`
)
process.exit(problemas || colisoes ? 1 : 0)
