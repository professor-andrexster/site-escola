import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  // Buscar o aluno vinculado a este usuário
  const admin = createAdminClient()

  // Procura na tabela identidades o aluno_id vinculado a este user_id
  const { data: identidade } = await admin
    .from('identidades')
    .select('aluno_id')
    .eq('user_id', user.id)
    .single()

  if (!identidade) {
    return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 })
  }

  // Buscar dados do aluno
  const { data: aluno } = await admin
    .from('alunos')
    .select('id, nome, matricula, turma, email, telefone, responsavel, data_nascimento, foto_url')
    .eq('id', identidade.aluno_id)
    .single()

  if (!aluno) {
    return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 })
  }

  return NextResponse.json(aluno)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  // Buscar o aluno_id vinculado a este usuário
  const admin = createAdminClient()
  const { data: identidade } = await admin
    .from('identidades')
    .select('aluno_id')
    .eq('user_id', user.id)
    .single()

  if (!identidade) {
    return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 })
  }

  const body = await request.json() as {
    email?: string
    telefone?: string
    responsavel?: string
    foto_url?: string | null
  }

  // Validações
  if (body.email && !REGEX_EMAIL.test(body.email.trim())) {
    return NextResponse.json({ error: 'E-mail inválido. Insira um e-mail válido (ex: aluno@escola.com).' }, { status: 400 })
  }

  // Verificar se o e-mail já existe para outro aluno
  if (body.email) {
    const { data: existing } = await admin
      .from('alunos')
      .select('id')
      .eq('email', body.email.trim())
      .neq('id', identidade.aluno_id)
      .limit(1)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Já existe outro aluno com esse e-mail.' }, { status: 400 })
    }
  }

  // Atualizar apenas os campos permitidos
  const dados: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  if (body.email !== undefined) dados.email = body.email?.trim() || null
  if (body.telefone !== undefined) dados.telefone = body.telefone?.trim() || null
  if (body.responsavel !== undefined) dados.responsavel = body.responsavel?.trim() || null
  if (body.foto_url !== undefined) dados.foto_url = body.foto_url || null

  const { error } = await admin
    .from('alunos')
    .update(dados)
    .eq('id', identidade.aluno_id)

  if (error) {
    return NextResponse.json({ error: 'Erro ao atualizar: ' + error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
