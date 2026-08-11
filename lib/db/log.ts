import { prisma } from '@/lib/db'
import type { AcaoLog } from '@/lib/log'

/**
 * Log de auditoria — quem entrou, quem se cadastrou, o que foi recusado.
 *
 * ARMADILHA DO JSON: `detalhes` era jsonb no Postgres e virou JSON no
 * MariaDB, que por baixo e longtext. O Prisma tipa como String. Passar um
 * objeto direto grava "[object Object]" ou estoura a CHECK — e como
 * registrarAtividade engole o proprio erro de proposito (log nunca deve
 * derrubar o fluxo), a falha seria silenciosa e o log de auditoria pararia
 * de servir sem ninguem notar.
 *
 * Por isso a serializacao mora aqui, e nao em cada chamador.
 */

export async function registrar(entrada: {
  acao: AcaoLog
  userId?: string | null
  detalhes?: Record<string, unknown> | null
  ip?: string | null
}) {
  try {
    await prisma.log_atividades.create({
      data: {
        acao: entrada.acao,
        user_id: entrada.userId ?? null,
        detalhes: entrada.detalhes ? JSON.stringify(entrada.detalhes) : null,
        ip: entrada.ip ?? null,
      },
    })
  } catch (erro) {
    // Falha no log nunca derruba o fluxo principal — mas precisa aparecer
    // em algum lugar, senao repetimos o problema que a auditoria apontou.
    console.error('[log_atividades] falha ao registrar', erro)
  }
}

/**
 * Conta registros recentes de uma acao, para o rate limit que o proprio log
 * alimenta. `chave`/`valor` filtram dentro do JSON de detalhes.
 */
export async function contarRecentes(opts: {
  acao: AcaoLog
  janelaMin: number
  chave?: string
  valor?: string
  ip?: string | null
}): Promise<number> {
  const desde = new Date(Date.now() - opts.janelaMin * 60_000)

  // O filtro por campo interno usa JSON_EXTRACT do MariaDB. No Postgres era
  // o operador ->>; aqui precisa de SQL cru, porque o Prisma tipa a coluna
  // como String e nao oferece navegacao em JSON.
  if (opts.chave && opts.valor) {
    const linhas = await prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*) AS total FROM log_atividades
      WHERE acao = ${opts.acao}
        AND criado_em >= ${desde}
        AND JSON_UNQUOTE(JSON_EXTRACT(detalhes, ${'$.' + opts.chave})) = ${opts.valor}
    `
    return Number(linhas[0]?.total ?? 0)
  }

  return prisma.log_atividades.count({
    where: {
      acao: opts.acao,
      criado_em: { gte: desde },
      ...(opts.ip ? { ip: opts.ip } : {}),
    },
  })
}

/** Ultimas atividades, para a tela de auditoria da gestao. */
export async function ultimas(limite = 50) {
  const linhas = await prisma.log_atividades.findMany({
    orderBy: { criado_em: 'desc' },
    take: limite,
  })
  return linhas.map(l => ({
    ...l,
    detalhes: l.detalhes ? (JSON.parse(l.detalhes) as Record<string, unknown>) : null,
    criado_em: l.criado_em?.toISOString() ?? null,
  }))
}
