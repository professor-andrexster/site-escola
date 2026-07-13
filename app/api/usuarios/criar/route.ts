import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirDirecao } from '@/lib/apiDirecao'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { registrarAtividade, ipDoRequest } from '@/lib/log'

export async function POST(request: Request) {
  const auth = await exigirDirecao()
  if (!auth.ok) return auth.res

  const body = await request.json()
  const { nome, email, password, role, turma, disciplina, cpf, dataNascimento, matricula } = body as {
    nome?: string
    email?: string
    password?: string
    role?: 'aluno' | 'monitor' | 'professor' | 'direcao'
    turma?: string
    disciplina?: string
    cpf?: string
    dataNascimento?: string
    matricula?: string
  }

  if (!nome?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 })
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

  const admin = createAdminClient()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  })

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? 'Erro ao criar usuário.' }, { status: 400 })
  }

  const userId = created.user.id
  async function desfazer(mensagem: string, status = 400) {
    await admin.from('profiles').delete().eq('id', userId)
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: mensagem }, { status })
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    nome_completo: nome.trim(),
    role,
    turma: role === 'aluno' || role === 'monitor' ? turma || null : null,
    disciplina: role === 'professor' ? disciplina?.trim() || null : null,
    aprovado: true,
    email: email.trim().toLowerCase(),
  })
  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Erro ao salvar perfil: ' + profileError.message }, { status: 400 })
  }

  const { error: identError } = await admin.from('identidades').insert({
    user_id: userId,
    cpf: cpfLimpo,
    data_nascimento: dataNascimento || null,
    criado_via: 'direcao',
  })
  if (identError) {
    if (identError.code === '23505') {
      return desfazer('Esse CPF já está vinculado a outra conta.')
    }
    return desfazer('Erro ao salvar identidade: ' + identError.message)
  }

  // Se for aluno com matrícula informada, vincula ao registro acadêmico
  let vinculo: string | null = null
  if (role === 'aluno' && matricula?.trim()) {
    const { data: alunoBase } = await admin
      .from('alunos')
      .select('id, user_id')
      .eq('matricula', matricula.trim())
      .maybeSingle()
    if (alunoBase && !alunoBase.user_id) {
      await admin.from('alunos').update({ user_id: userId }).eq('id', alunoBase.id)
      vinculo = matricula.trim()
    }
  }

  await registrarAtividade(admin, {
    acao: 'usuario_criado_direcao',
    userId,
    detalhes: { role, criado_por: auth.userId, matricula_vinculada: vinculo },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true })
}
