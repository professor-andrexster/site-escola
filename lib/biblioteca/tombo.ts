import { prisma } from '@/lib/db'

/**
 * Proximo tombo livre para um prefixo.
 *
 * Le todos os tombos do prefixo e pega o maior numero. Nao e a forma mais
 * eficiente, mas e a que resiste a tombo digitado na mao fora de sequencia,
 * que e o caso real de um acervo herdado.
 *
 * ATENCAO: nao ha reserva de numero. Dois cadastros simultaneos podem calcular
 * o mesmo tombo, e o segundo esbarra na unique. A rota trata esse erro; o
 * comportamento e o mesmo de antes da migracao.
 */
export async function gerarProximoTombo(prefixo: string): Promise<string> {
  const linhas = await prisma.biblioteca_exemplares.findMany({
    where: { tombo: { startsWith: prefixo } },
    select: { tombo: true },
  })

  let maiorNumero = 0
  for (const { tombo } of linhas) {
    const numero = parseInt(tombo.slice(prefixo.length), 10)
    if (!Number.isNaN(numero) && numero > maiorNumero) maiorNumero = numero
  }

  return `${prefixo}${String(maiorNumero + 1).padStart(6, '0')}`
}
