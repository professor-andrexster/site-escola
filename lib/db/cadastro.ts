import { prisma } from '@/lib/db'

/**
 * Criacao de conta — a parte que mexe em tres tabelas de uma vez.
 *
 * O fluxo tem duas metades que nao podem ser uma transacao so: a conta de
 * acesso vive fora do banco (Supabase Auth hoje, tabela `usuarios` na fase 4),
 * e profiles/identidades/alunos vivem dentro.
 *
 * O codigo antigo desfazia na mao, em degraus: se identidades falhava, apagava
 * profiles; se profiles falhava, apagava a conta. Cada degrau era um `await`
 * solto que podia falhar tambem, e ai sobrava metade.
 *
 * Aqui as tres tabelas viram uma transacao. A rota so precisa desfazer UMA
 * coisa quando ela falha: a conta de acesso.
 */

export class CpfJaVinculado extends Error {}

export async function vincularCadastroDeAluno(dados: {
  userId: string
  alunoId: string
  nome: string
  turma: string
  email: string
  cpf: string
  dataNascimento: Date
  emailAlternativo?: string | null
  aprovado: boolean
}) {
  try {
    return await prisma.$transaction(async tx => {
      await tx.profiles.create({
        data: {
          id: dados.userId,
          nome_completo: dados.nome,
          role: 'aluno',
          turma: dados.turma,
          disciplina: null,
          aprovado: dados.aprovado,
          email: dados.email,
        },
      })

      await tx.identidades.create({
        data: {
          user_id: dados.userId,
          cpf: dados.cpf,
          data_nascimento: dados.dataNascimento,
          email_alternativo: dados.emailAlternativo ?? null,
          criado_via: 'auto_aluno',
        },
      })

      // O vinculo ficha<->conta: alunos.user_id. Nao identidades.aluno_id,
      // que nao existe.
      await tx.alunos.update({
        where: { id: dados.alunoId },
        data: { user_id: dados.userId },
      })
    })
  } catch (erro) {
    // P2002 e violacao de unique. No CPF significa que outra conta ja o usa.
    if ((erro as { code?: string })?.code === 'P2002') {
      throw new CpfJaVinculado('Esse CPF já está vinculado a outra conta. Procure a direção.')
    }
    throw erro
  }
}

/** Mesma ideia para conta criada pela gestao, que pode nao ser de aluno. */
export async function criarContaInterna(dados: {
  userId: string
  nome: string
  role: string
  turma?: string | null
  disciplina?: string | null
  email: string
  cpf: string
  dataNascimento?: Date | null
  matricula?: string | null
}) {
  try {
    return await prisma.$transaction(async tx => {
      await tx.profiles.create({
        data: {
          id: dados.userId,
          nome_completo: dados.nome,
          role: dados.role,
          turma: dados.turma ?? null,
          disciplina: dados.disciplina ?? null,
          aprovado: true,
          email: dados.email,
        },
      })

      await tx.identidades.create({
        data: {
          user_id: dados.userId,
          cpf: dados.cpf,
          data_nascimento: dados.dataNascimento ?? null,
          criado_via: 'direcao',
        },
      })

      // Se for aluno com matricula, liga a ficha academica — mas so quando ela
      // ainda nao tem conta, para nao roubar o vinculo de outra.
      let vinculo: string | null = null
      if (dados.matricula) {
        const ficha = await tx.alunos.findFirst({
          where: { matricula: dados.matricula, user_id: null },
          select: { id: true },
        })
        if (ficha) {
          await tx.alunos.update({ where: { id: ficha.id }, data: { user_id: dados.userId } })
          vinculo = ficha.id
        }
      }
      return { vinculo }
    })
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      throw new CpfJaVinculado('Esse CPF já está vinculado a outra conta.')
    }
    throw erro
  }
}
