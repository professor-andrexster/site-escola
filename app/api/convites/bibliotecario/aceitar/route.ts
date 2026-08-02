import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { registrarAtividade, ipDoRequest } from '@/lib/log'

const MSG_TOKEN_INVALIDO = 'Este link de convite não é válido ou já expirou. Peça um novo convite à direção da escola.'

// Usado pela página de aceite para mostrar nome e email antes de pedir a senha.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Convite não informado.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: convite } = await admin
    .from('convites_usuario')
    .select('nome, email, aceito_em, revogado_em, expira_em')
    .eq('token', token)
    .maybeSingle()

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
  if (senha.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
  }

  let cpfLimpo: string | null = null
  if (cpf?.trim()) {
    cpfLimpo = limparCPF(cpf)
    if (!validarCPF(cpfLimpo)) {
      return NextResponse.json({ error: 'CPF inválido. Confira os números digitados.' }, { status: 400 })
    }
  }

  const admin = createAdminClient()

  const { data: convite } = await admin
    .from('convites_usuario')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (!convite || convite.aceito_em || convite.revogado_em || new Date(convite.expira_em) < new Date()) {
    return NextResponse.json({ error: MSG_TOKEN_INVALIDO }, { status: 400 })
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: convite.email,
    password: senha,
    email_confirm: true,
  })
  if (createError || !created.user) {
    const duplicado = createError?.message?.toLowerCase().includes('already')
    return NextResponse.json(
      { error: duplicado ? 'Já existe uma conta com esse email.' : 'Erro ao criar a conta. Tente novamente.' },
      { status: 400 }
    )
  }

  const userId = created.user.id
  async function desfazer(mensagem: string) {
    await admin.from('profiles').delete().eq('id', userId)
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: mensagem }, { status: 400 })
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    nome_completo: convite.nome,
    role: 'bibliotecario',
    turma: null,
    disciplina: null,
    aprovado: true,
    email: convite.email,
  })
  if (profileError) return desfazer('Erro ao salvar o perfil. Tente novamente.')

  if (cpfLimpo) {
    const { error: identError } = await admin.from('identidades').insert({
      user_id: userId,
      cpf: cpfLimpo,
      criado_via: 'convite_bibliotecario',
    })
    if (identError) {
      if (identError.code === '23505') {
        return desfazer('Esse CPF já está vinculado a outra conta.')
      }
      return desfazer('Erro ao salvar seus dados. Tente novamente.')
    }
  }

  await admin.from('convites_usuario').update({ aceito_em: new Date().toISOString(), usuario_id: userId }).eq('id', convite.id)
  await registrarAtividade(admin, {
    acao: 'convite_bibliotecario_aceito',
    userId,
    detalhes: { email: convite.email },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true })
}
