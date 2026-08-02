import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirProfessorOuGestao } from '@/lib/apiGestao'
import { registrarAtividade, ipDoRequest } from '@/lib/log'

// Libera o acesso de um cadastro pendente. Professor so pode aprovar aluno,
// nunca outro professor nem a si mesmo; gestao pode aprovar qualquer papel,
// menos a propria conta.
export async function POST(request: Request) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const { userId } = (await request.json()) as { userId?: string }
  if (!userId) return NextResponse.json({ error: 'Usuário não informado.' }, { status: 400 })
  if (userId === auth.userId) {
    return NextResponse.json({ error: 'Você não pode aprovar a própria conta.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: alvo } = await admin.from('profiles').select('role, aprovado').eq('id', userId).maybeSingle()
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  if (auth.role === 'professor' && alvo.role !== 'aluno') {
    return NextResponse.json({ error: 'Professor só pode aprovar cadastro de aluno.' }, { status: 403 })
  }

  const { error } = await admin.from('profiles').update({ aprovado: true }).eq('id', userId)
  if (error) return NextResponse.json({ error: 'Erro ao aprovar: ' + error.message }, { status: 400 })

  await registrarAtividade(admin, {
    acao: auth.role === 'professor' ? 'aluno_aprovado_professor' : 'usuario_aprovado_gestao',
    userId,
    detalhes: { aprovado_por: auth.userId, role: alvo.role },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true })
}
