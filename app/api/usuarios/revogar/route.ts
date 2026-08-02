import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirGestao } from '@/lib/apiGestao'
import { registrarAtividade, ipDoRequest } from '@/lib/log'

// Tira o acesso de alguem que ja estava aprovado, sem apagar a conta. So
// gestao pode fazer isso, diferente de aprovar, que professor tambem pode
// fazer quando o alvo e aluno.
export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { userId } = (await request.json()) as { userId?: string }
  if (!userId) return NextResponse.json({ error: 'Usuário não informado.' }, { status: 400 })
  if (userId === auth.userId) {
    return NextResponse.json({ error: 'Você não pode revogar o próprio acesso.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: alvo } = await admin.from('profiles').select('role, aprovado').eq('id', userId).maybeSingle()
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  const { error } = await admin.from('profiles').update({ aprovado: false }).eq('id', userId)
  if (error) return NextResponse.json({ error: 'Erro ao revogar acesso: ' + error.message }, { status: 400 })

  await registrarAtividade(admin, {
    acao: 'usuario_revogado_gestao',
    userId,
    detalhes: { revogado_por: auth.userId, role: alvo.role },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true })
}
