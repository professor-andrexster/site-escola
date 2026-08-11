import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

/**
 * Cliente do MariaDB. Mesmo padrao usado no porto-sistema: pool pequeno e
 * abertura preguicosa, para que cada reinicio do processo nao abra dez
 * conexoes de uma vez so para aquecer o pool.
 *
 * Aqui o banco e local (127.0.0.1), entao o teto de conexoes nao aperta como
 * num host remoto — mas o pool pequeno continua sendo o certo: sao cinco
 * sistemas dividindo o mesmo MariaDB neste servidor.
 */
function configDoPool(databaseUrl: string) {
  const url = new URL(databaseUrl)
  return {
    connectionLimit: 5,
    minimumIdle: 1,
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    database: url.pathname.replace(/^\//, ''),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  }
}

const adapter = new PrismaMariaDb(configDoPool(process.env.DATABASE_URL as string))

const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalParaPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

// Em desenvolvimento o hot reload recria o modulo a cada alteracao; sem este
// cache o processo acumula um pool novo por recarga ate esgotar o servidor.
if (process.env.NODE_ENV !== 'production') globalParaPrisma.prisma = prisma
