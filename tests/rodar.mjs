/**
 * Roda as suites de lib/db contra o MariaDB.
 *   node tests/rodar.mjs
 * Carrega DATABASE_URL do .env.local — sem isso cada suite falha por falta
 * de conexao e parece bug de codigo (aconteceu).
 */
import { readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

if (!process.env.DATABASE_URL) {
  try {
    const linha = readFileSync('.env.local', 'utf8')
      .split('\n').find(l => l.startsWith('DATABASE_URL='))
    if (linha) process.env.DATABASE_URL = linha.slice('DATABASE_URL='.length).trim()
  } catch { /* segue e falha com mensagem clara abaixo */ }
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL nao definida e .env.local nao encontrado.')
  process.exit(2)
}

let falhas = 0
for (const arquivo of readdirSync('tests').filter(f => f.startsWith('db-') && f.endsWith('.mjs')).sort()) {
  process.stdout.write(`\n── ${arquivo}\n`)
  try {
    execFileSync(process.execPath, [`tests/${arquivo}`], { stdio: 'inherit', env: process.env })
  } catch {
    falhas++
  }
}
console.log(falhas ? `\n${falhas} suite(s) falharam` : '\ntodas as suites passaram')
process.exit(falhas ? 1 : 0)
