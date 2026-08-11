import { NextResponse } from 'next/server'
import { conviteAtivoDoToken, aceitarConvite } from '@/lib/db/convites'
import { criarConta, removerConta, EmailJaCadastrado } from '@/lib/auth/sessao'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'
import { senhaFraca } from '@/lib/auth/senha'

const MSG_TOKEN_INVALIDO = 'Este link de convite não é válido ou já expirou. Peça um novo convite à direção da escola.'

// Usado pela página de aceite para mostrar nome e email antes de pedir a senha.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Convite não informado.' }, { status: 400 })

  const convite = await conviteAtivoDoToken(token)

  if (!convite || convite.aceito_em || convite.revogado_em || new Date(convite.expira_em) < new Date()) {
    return NextResponse.json({ error: MSG_TOKEN_INVALIDO }, { status: 400 })
  }

  return NextResponse.json({ nome: convite.nome, email: convite.email })
}

export async function POST(request: Request) {
  const { token, senha, cpf } = (await request.json()) as { token?: string; senha?: string; cpf?: string }

  if (!token || !senha) {
    return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 })
  }
  const fraca = senhaFraca(senha)
  if (fraca) {
    return NextResponse.json({ error: fraca }, { status: 400 })
  }

  let cpfLimpo: string | null = null
  if (cpf?.trim()) {
    cpfLimpo = limparCPF(cpf)
    if (!validarCPF(cpfLimpo)) {
      return NextResponse.json({ error: 'CPF inválido. Confira os números digitados.' }, { status: 400 })
    }
  }


  const convite = await conviteAtivoDoToken(token)

  if (!convite || convite.aceito_em || convite.revogado_em || new Date(convite.expira_em) < new Date()) {
    return NextResponse.json({ error: MSG_TOKEN_INVALIDO }, { status: 400 })
  }

  let userId: string
  try {
    userId = await criarConta(convite.email, senha)
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

  // Perfil, identidade e a marcacao do convite como aceito, numa transacao.
  // Solto, falha no meio deixava o convite consumido sem conta criada — e o
  // token nao serve mais, entao a pessoa ficava trancada de fora para sempre.
  try {
    await aceitarConvite({
      conviteId: convite.id,
      userId,
      nome: convite.nome,
      email: convite.email,
      papel: 'bibliotecario',
      cpf: cpfLimpo || null,
    })
  } catch (erro) {
    console.error('[convites/aceitar] falha', erro)
    await removerConta(userId)
    const duplicado = (erro as { code?: string })?.code === 'P2002'
    return NextResponse.json(
      { error: duplicado ? 'Esse CPF já está vinculado a outra conta.' : 'Erro ao salvar seus dados. Tente novamente.' },
      { status: 400 }
    )
  }
  await registrar({
    acao: 'convite_bibliotecario_aceito',
    userId,
    detalhes: { email: convite.email },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true })
}
