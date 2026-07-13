import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { registrarAtividade, ipDoRequest } from '@/lib/log'

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
  if (senha.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
  }
  const cpfLimpo = limparCPF(cpf)
  if (!validarCPF(cpfLimpo)) {
    return NextResponse.json({ error: 'CPF inválido. Confira os números digitados.' }, { status: 400 })
  }

  const ip = ipDoRequest(request)
  const admin = createAdminClient()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
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

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    nome_completo: nome.trim(),
    role: 'professor',
    turma: null,
    disciplina: disciplina?.trim() || null,
    aprovado: false,
    email: email.trim().toLowerCase(),
  })
  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Erro ao salvar o perfil. Tente novamente.' }, { status: 400 })
  }

  const { error: identError } = await admin.from('identidades').insert({
    user_id: userId,
    cpf: cpfLimpo,
    data_nascimento: dataNascimento || null,
    criado_via: 'auto_professor',
  })
  if (identError) {
    await admin.from('profiles').delete().eq('id', userId)
    await admin.auth.admin.deleteUser(userId)
    if (identError.code === '23505') {
      return NextResponse.json({ error: 'Esse CPF já está vinculado a outra conta.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao salvar seus dados. Tente novamente.' }, { status: 400 })
  }

  await registrarAtividade(admin, { acao: 'cadastro_professor', userId, detalhes: { nome: nome.trim() }, ip })

  return NextResponse.json({ ok: true })
}
