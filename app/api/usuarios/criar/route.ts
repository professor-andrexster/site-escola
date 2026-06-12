import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, aprovado')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.aprovado || profile.role !== 'direcao') {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
  }

  const body = await request.json()
  const { nome, email, password, role, turma, disciplina } = body as {
    nome?: string
    email?: string
    password?: string
    role?: 'aluno' | 'monitor' | 'professor' | 'direcao'
    turma?: string
    disciplina?: string
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

  const admin = createAdminClient()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  })

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? 'Erro ao criar usuário.' }, { status: 400 })
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    nome_completo: nome.trim(),
    role,
    turma: role === 'aluno' || role === 'monitor' ? turma || null : null,
    disciplina: role === 'professor' ? disciplina?.trim() || null : null,
    aprovado: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: 'Erro ao salvar perfil: ' + profileError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
