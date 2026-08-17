/**
 * Compara a contagem de linhas de cada tabela entre o Postgres e o MariaDB.
 *
 *   PGURL=... DATABASE_URL=... node scripts/conferir-migracao.mjs
 *
 * É o passo que fecha a virada: sem ele, uma tabela que falhou em silêncio só
 * aparece quando alguém abre a tela e não encontra o próprio dado.
 */
import { execFileSync } from 'node:child_process'
import { prisma } from '../lib/db.ts'

const PGURL = process.env.PGURL
if (!PGURL) { console.error('Defina PGURL.'); process.exit(2) }

const contarPg = t => Number(execFileSync('psql',
  [PGURL, '-X', '--no-psqlrc', '-q', '-t', '-A', '-c', `select count(*) from public.${t}`],
  { encoding: 'utf8' }).trim())

const TABELAS = Object.keys(prisma._runtimeDataModel.models).filter(t => t !== 'usuarios' && t !== 'sessoes' && t !== 'tokens_senha')

let divergentes = 0
for (const tabela of TABELAS.sort()) {
  let pg
  try { pg = contarPg(tabela) } catch { console.log(`  ${tabela.padEnd(28)} — só existe no MariaDB`); continue }
  const my = await prisma[tabela].count()
  if (pg !== my) { console.log(`  ${tabela.padEnd(28)} pg=${pg}  mariadb=${my}   DIVERGE`); divergentes++ }
  else if (pg > 0) console.log(`  ${tabela.padEnd(28)} ${pg}  ok`)
}

// Contas e perfis NÃO precisam bater em número: `auth.users` tem contas que
// nunca completaram o cadastro e por isso não têm perfil. O que não pode
// acontecer é o contrário — perfil sem conta é gente trancada do lado de fora.
const contas = await prisma.usuarios.count()
const perfis = await prisma.profiles.count()
// SQL cru porque a relação profiles→usuarios é obrigatória no schema, e o
// Prisma não deixa filtrar por ela nula. Só que a importação roda com as FKs
// desligadas — então o caso PODE existir no banco, e é justamente ele que
// precisa ser conferido.
const [{ n: semConta }] = await prisma.$queryRawUnsafe(
  'SELECT COUNT(*) AS n FROM profiles p LEFT JOIN usuarios u ON u.id = p.id WHERE u.id IS NULL'
)
console.log(`\n  usuarios ${contas} / profiles ${perfis}`)
console.log(`  perfis sem conta: ${semConta} — ${Number(semConta) === 0 ? 'ok' : 'PROBLEMA: essas pessoas não conseguem entrar'}`)
if (contas > perfis) {
  console.log(`  ${contas - perfis} conta(s) sem perfil: entram, mas não têm acesso a nada`)
}

const semSenha = await prisma.usuarios.count({ where: { encrypted_password: null } })
console.log(`  contas sem hash de senha: ${semSenha}${semSenha ? ' — vão precisar redefinir' : ' — ninguém precisa trocar de senha'}`)

await prisma.$disconnect()
console.log(divergentes ? `\n${divergentes} tabela(s) divergente(s)` : '\ntodas as contagens batem')
process.exit(divergentes || Number(semConta) ? 1 : 0)
