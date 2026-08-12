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

const contas = await prisma.usuarios.count()
const perfis = await prisma.profiles.count()
console.log(`\n  usuarios ${contas} / profiles ${perfis} — ${contas === perfis ? 'ok' : 'DIVERGE'}`)
const semSenha = await prisma.usuarios.count({ where: { encrypted_password: null } })
if (semSenha) console.log(`  ${semSenha} conta(s) sem hash: vão precisar redefinir a senha`)

await prisma.$disconnect()
console.log(divergentes ? `\n${divergentes} tabela(s) divergente(s)` : '\ntodas as contagens batem')
process.exit(divergentes || contas !== perfis ? 1 : 0)
