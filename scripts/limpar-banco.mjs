/**
 * Esvazia o MariaDB da escola, para reimportar do zero.
 *
 *   DATABASE_URL='mysql://...' node scripts/limpar-banco.mjs --confirmo
 *
 * Existe porque o ensaio da migração deixa dados reais no banco, e a virada
 * precisa importar de novo — com as escritas já congeladas — para pegar o que
 * mudou desde o ensaio. Sem zerar antes, o `skipDuplicates` deixaria as linhas
 * antigas paradas no tempo.
 *
 * Exige `--confirmo` no comando. Apagar tudo não pode ser o que acontece
 * quando alguém aperta a seta pra cima sem ler.
 */
import { prisma } from '../lib/db.ts'

if (!process.argv.includes('--confirmo')) {
  console.error(
    'Este script APAGA todos os dados de escola_jb.\n' +
    'Se é isso mesmo, rode de novo com --confirmo.'
  )
  process.exit(2)
}

const MANTER = new Set(['sessoes', 'tokens_senha'])

const tabelas = Object.keys(prisma._runtimeDataModel.models).filter(t => !MANTER.has(t))

try {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0')

  // Sessões e tokens caem junto com usuarios, por cascata — mas listar aqui
  // deixa claro que ninguém continua logado depois de uma reimportação.
  for (const tabela of ['tokens_senha', 'sessoes', ...tabelas]) {
    const apagadas = await prisma[tabela].deleteMany({})
    if (apagadas.count) console.log(`  ${tabela}: ${apagadas.count}`)
  }
} finally {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1')
}

const sobrando = []
for (const tabela of tabelas) {
  const n = await prisma[tabela].count()
  if (n) sobrando.push(`${tabela}=${n}`)
}

await prisma.$disconnect()

if (sobrando.length) {
  console.error(`\nsobrou coisa: ${sobrando.join(', ')}`)
  process.exit(1)
}
console.log('\nbanco vazio')
