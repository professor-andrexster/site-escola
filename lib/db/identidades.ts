import { prisma } from '@/lib/db'

/**
 * Identidades — CPF, data de nascimento e email alternativo de cada conta.
 *
 * A tabela NAO tem coluna aluno_id, apesar de a rota de perfil ter procurado
 * por ela por meses. O vinculo ficha<->conta e alunos.user_id. Registrado aqui
 * porque este e o arquivo onde alguem viria procurar.
 */

/** Dados de identidade de um conjunto de contas, para as telas de gestao. */
export async function porUsuarios(userIds: string[]) {
  if (!userIds.length) return []
  return prisma.identidades.findMany({
    where: { user_id: { in: userIds } },
    select: { user_id: true, cpf: true, email_alternativo: true, criado_via: true },
  })
}

/** Resolve CPF -> conta. Usado pelo login por CPF. */
export async function contaDoCpf(cpf: string): Promise<string | null> {
  const i = await prisma.identidades.findFirst({
    where: { cpf },
    select: { user_id: true },
  })
  return i?.user_id ?? null
}

export async function criar(dados: {
  user_id: string
  cpf: string
  data_nascimento?: Date | null
  email_alternativo?: string | null
  criado_via: string
}) {
  return prisma.identidades.create({ data: dados })
}

export async function remover(userId: string) {
  return prisma.identidades.delete({ where: { user_id: userId } })
}
