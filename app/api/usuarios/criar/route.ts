import { NextResponse } from 'next/server'
import { criarConta, removerConta, EmailJaCadastrado } from '@/lib/auth/sessao'
import { criarContaInterna, CpfJaVinculado } from '@/lib/db/cadastro'
import { exigirGestao } from '@/lib/apiGestao'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { normalizarMatricula } from '@/lib/matricula'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'

export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const body = await request.json()
  const { nome, email, password, role, turma, disciplina, cpf, dataNascimento, matricula } = body as {
    nome?: string
    email?: string
    password?: string
    role?: 'aluno' | 'aluno_fundamental' | 'monitor' | 'professor' | 'diretora' | 'vice_diretora' | 'admin' | 'bibliotecario'
    turma?: string
    disciplina?: string
    cpf?: string
    dataNascimento?: string
    matricula?: string
  }

  if (!nome?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 })
  }
  if (role === 'bibliotecario') {
    return NextResponse.json(
      { error: 'Bibliotecária é cadastrada por convite, na tela de configurações da biblioteca.' },
      { status: 400 }
    )
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
  }
  if (role === 'aluno' && !turma) {
    return NextResponse.json({ error: 'Selecione a turma do aluno.' }, { status: 400 })
  }
  if (!cpf) {
    return NextResponse.json({ error: 'Informe o CPF.' }, { status: 400 })
  }
  const cpfLimpo = limparCPF(cpf)
  if (!validarCPF(cpfLimpo)) {
    return NextResponse.json({ error: 'CPF inválido. Confira os números digitados.' }, { status: 400 })
  }

  let userId: string
  try {
    userId = await criarConta(email, password)
  } catch (erro) {
    return NextResponse.json(
      {
        error:
          erro instanceof EmailJaCadastrado
            ? 'Já existe uma conta com esse email.'
            : 'Erro ao criar usuário.',
      },
      { status: 400 }
    )
  }

  // Perfil, identidade e o vinculo com a ficha academica numa transacao. Se
  // falhar, so a conta de acesso precisa ser desfeita.
  let vinculo: string | null = null
  try {
    const r = await criarContaInterna({
      userId,
      nome: nome.trim(),
      role,
      turma: role === 'aluno' || role === 'aluno_fundamental' || role === 'monitor' ? turma || null : null,
      disciplina: role === 'professor' ? disciplina?.trim() || null : null,
      email: email.trim().toLowerCase(),
      cpf: cpfLimpo,
      dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
      matricula: role === 'aluno' && matricula?.trim() ? normalizarMatricula(matricula) : null,
      criadoVia: 'gestao',
      aprovado: true,
    })
    vinculo = r.vinculo
  } catch (erro) {
    console.error('[usuarios/criar] falha ao criar conta interna', erro)
    await removerConta(userId)
    return NextResponse.json(
      {
        error:
          erro instanceof CpfJaVinculado ? erro.message : 'Erro ao salvar os dados do usuário.',
      },
      { status: 400 }
    )
  }

  await registrar({
    acao: 'usuario_criado_direcao',
    userId,
    detalhes: { role, criado_por: auth.userId, matricula_vinculada: vinculo },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true })
}
