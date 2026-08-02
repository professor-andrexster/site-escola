import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirGestao } from '@/lib/apiGestao'
import { registrarAtividade, ipDoRequest } from '@/lib/log'
import type { Profile } from '@/types/database'

const ROLES_VALIDOS: Profile['role'][] = ['aluno', 'monitor', 'professor', 'bibliotecario', 'diretora', 'vice_diretora', 'admin']

// Troca o nivel de acesso de um usuario. So gestao pode fazer isso.
export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { userId, role } = (await request.json()) as { userId?: string; role?: Profile['role'] }
  if (!userId || !role) return NextResponse.json({ error: 'Preencha os dados necessários.' }, { status: 400 })
  if (!ROLES_VALIDOS.includes(role)) return NextResponse.json({ error: 'Nível de acesso inválido.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: alvo } = await admin.from('profiles').select('role').eq('id', userId).maybeSingle()
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  const { error } = await admin.from('profiles').update({ role }).eq('id', userId)
  if (error) return NextResponse.json({ error: 'Erro ao mudar nível de acesso: ' + error.message }, { status: 400 })

  await registrarAtividade(admin, {
    acao: 'papel_alterado',
    userId,
    detalhes: { alterado_por: auth.userId, de: alvo.role, para: role },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true })
}
