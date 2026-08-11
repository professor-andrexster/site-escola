import { prisma } from '@/lib/db'

/**
 * Convites de acesso — hoje so para bibliotecario.
 *
 * Um convite e "ativo" quando nao foi aceito, nao foi revogado e ainda nao
 * expirou. As tres condicoes juntas: faltar uma faz convite antigo voltar a
 * valer, ou convite revogado ainda funcionar.
 */

const ATIVO = {
  aceito_em: null,
  revogado_em: null,
} as const

export async function conviteAtivoDoEmail(email: string) {
  return prisma.convites_usuario.findFirst({
    where: { email, ...ATIVO, expira_em: { gt: new Date() } },
    select: { id: true },
  })
}

export async function conviteAtivoDoToken(token: string) {
  return prisma.convites_usuario.findFirst({
    where: { token, ...ATIVO, expira_em: { gt: new Date() } },
  })
}

export async function criarConvite(dados: {
  nome: string
  email: string
  papel: string
  token: string
  criadoPor: string
}) {
  return prisma.convites_usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      papel: dados.papel,
      token: dados.token,
      criado_por: dados.criadoPor,
    },
  })
}

/**
 * Cria a conta convidada: perfil, identidade quando ha CPF, e marca o convite
 * como aceito — tudo numa transacao. O codigo antigo desfazia em degraus, e
 * falha no meio deixava o convite consumido sem conta criada, o que tranca a
 * pessoa de fora para sempre (o token nao serve mais).
 */
export async function aceitarConvite(dados: {
  conviteId: string
  userId: string
  nome: string
  email: string
  papel: string
  cpf?: string | null
  dataNascimento?: Date | null
}) {
  return prisma.$transaction(async tx => {
    await tx.profiles.create({
      data: {
        id: dados.userId,
        nome_completo: dados.nome,
        role: dados.papel,
        turma: null,
        disciplina: null,
        aprovado: true,
        email: dados.email,
      },
    })

    if (dados.cpf) {
      await tx.identidades.create({
        data: {
          user_id: dados.userId,
          cpf: dados.cpf,
          data_nascimento: dados.dataNascimento ?? null,
          criado_via: 'convite_bibliotecario',
        },
      })
    }

    await tx.convites_usuario.update({
      where: { id: dados.conviteId },
      data: { aceito_em: new Date(), usuario_id: dados.userId },
    })
  })
}
