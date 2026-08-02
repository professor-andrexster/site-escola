import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isGestao } from '@/lib/roles'
import { registrarAtividade, ipDoRequest } from '@/lib/log'

type CorpoPerfil = {
  userId?: string
  nomeCompleto?: string
  avatarUrl?: string | null
  disciplina?: string | null
  turma?: string | null
}

// Qualquer pessoa aprovada edita o proprio nome, foto, disciplina ou turma.
// Editar o perfil de outra pessoa (userId diferente do proprio) e so gestao.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const { data: perfilChamador } = await supabase.from('profiles').select('role, aprovado').eq('id', user.id).maybeSingle()
  if (!perfilChamador?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const body = (await request.json()) as CorpoPerfil
  const alvoId = body.userId || user.id

  if (alvoId !== user.id && !isGestao(perfilChamador.role)) {
    return NextResponse.json({ error: 'Você só pode editar o próprio perfil.' }, { status: 403 })
  }

  if (body.nomeCompleto !== undefined && !body.nomeCompleto.trim()) {
    return NextResponse.json({ error: 'O nome não pode ficar vazio.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: anterior } = await admin.from('profiles').select('*').eq('id', alvoId).maybeSingle()
  if (!anterior) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  const dados: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.nomeCompleto !== undefined) dados.nome_completo = body.nomeCompleto.trim()
  if (body.avatarUrl !== undefined) dados.avatar_url = body.avatarUrl || null
  if (body.disciplina !== undefined) dados.disciplina = body.disciplina?.trim() || null
  if (body.turma !== undefined) dados.turma = body.turma?.trim() || null

  const { data: perfil, error } = await admin.from('profiles').update(dados).eq('id', alvoId).select('*').single()
  if (error) return NextResponse.json({ error: 'Erro ao salvar: ' + error.message }, { status: 400 })

  await registrarAtividade(admin, {
    acao: 'perfil_atualizado',
    userId: alvoId,
    detalhes: { editado_por: user.id, proprio: alvoId === user.id },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ perfil })
}
