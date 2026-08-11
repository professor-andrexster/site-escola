import { NextResponse } from 'next/server'
import { criarConta, removerConta, EmailJaCadastrado } from '@/lib/auth/sessao'
import { criarContaInterna, CpfJaVinculado } from '@/lib/db/cadastro'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'
import { senhaFraca } from '@/lib/auth/senha'

export async function POST(request: Request) {
  const body = await request.json()
  const { nome, email, cpf, dataNascimento, disciplina, senha } = body as {
    nome?: string
    email?: string
    cpf?: string
    dataNascimento?: string
    disciplina?: string
    senha?: string
  }

  if (!nome?.trim() || !email?.trim() || !cpf || !senha) {
    return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 })
  }
  const fraca = senhaFraca(senha)
  if (fraca) {
    return NextResponse.json({ error: fraca }, { status: 400 })
  }

  const cpfLimpo = limparCPF(cpf)
  if (!validarCPF(cpfLimpo)) {
    return NextResponse.json({ error: 'CPF inválido. Confira os números digitados.' }, { status: 400 })
  }

  const ip = ipDoRequest(request)

  let userId: string
  try {
    userId = await criarConta(email, senha)
  } catch (erro) {
    return NextResponse.json(
      {
        error:
          erro instanceof EmailJaCadastrado
            ? 'Já existe uma conta com esse email.'
            : 'Erro ao criar a conta. Tente novamente.',
      },
      { status: 400 }
    )
  }

  // Professor entra pendente: quem aprova e a gestao, em /admin/aprovacoes.
  try {
    await criarContaInterna({
      userId,
      nome: nome.trim(),
      role: 'professor',
      turma: null,
      disciplina: disciplina?.trim() || null,
      email: email.trim().toLowerCase(),
      cpf: cpfLimpo,
      dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
      criadoVia: 'auto_professor',
      aprovado: false,
    })
  } catch (erro) {
    console.error('[cadastro/professor] falha ao criar conta', erro)
    await removerConta(userId)
    return NextResponse.json(
      {
        error:
          erro instanceof CpfJaVinculado ? erro.message : 'Erro ao salvar seus dados. Tente novamente.',
      },
      { status: 400 }
    )
  }

  await registrar({ acao: 'cadastro_professor', userId, detalhes: { nome: nome.trim() }, ip })

  return NextResponse.json({ ok: true })
}
