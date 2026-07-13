import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Reabre um quiz que deu errado: apaga respostas e participantes da rodada
// e volta o quiz para a sala de espera, pronto para jogar de novo.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, aprovado')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.aprovado || !['professor', 'monitor', 'direcao'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
  }

  const { quizId } = (await request.json()) as { quizId?: string }
  if (!quizId) return NextResponse.json({ error: 'Quiz não informado.' }, { status: 400 })

  const admin = createAdminClient()

  const { data: participantes } = await admin
    .from('quiz_participantes')
    .select('id')
    .eq('quiz_id', quizId)

  const ids = (participantes ?? []).map(p => p.id)
  if (ids.length > 0) {
    await admin.from('quiz_respostas').delete().in('participante_id', ids)
    await admin.from('quiz_participantes').delete().eq('quiz_id', quizId)
  }

  const { error } = await admin
    .from('quizzes')
    .update({
      encerrado: false,
      ativo: false,
      lobby_aberto: true,
      quiz_iniciado_em: null,
      pergunta_atual: 0,
      pergunta_liberada_em: null,
      resposta_revelada: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quizId)

  if (error) {
    return NextResponse.json({ error: 'Erro ao reabrir: ' + error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
