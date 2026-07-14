import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Encerra o quiz e FINALIZA todos os participantes no servidor, somando os
// pontos direto de quiz_respostas. Antes a pontuação dependia do celular de
// cada aluno salvar o próprio total no fim: em sala de aula (aba fechada,
// tela bloqueada) quase ninguém finalizava e o ranking ficava vazio.
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

  // Marca como encerrado primeiro: os alunos ainda conectados são
  // redirecionados para a tela de resultado via Realtime.
  const { error: quizError } = await admin
    .from('quizzes')
    .update({ ativo: false, lobby_aberto: false, encerrado: true, updated_at: new Date().toISOString() })
    .eq('id', quizId)
  if (quizError) {
    return NextResponse.json({ error: 'Erro ao encerrar: ' + quizError.message }, { status: 400 })
  }

  // Consolida a pontuação de TODOS os participantes a partir das respostas.
  const [{ data: participantes }, { data: respostas }] = await Promise.all([
    admin.from('quiz_participantes').select('id').eq('quiz_id', quizId),
    admin
      .from('quiz_respostas')
      .select('participante_id, pontos_obtidos, quiz_perguntas!inner(quiz_id)')
      .eq('quiz_perguntas.quiz_id', quizId),
  ])

  const totais = new Map<string, number>()
  for (const r of respostas ?? []) {
    totais.set(r.participante_id, (totais.get(r.participante_id) ?? 0) + (r.pontos_obtidos ?? 0))
  }

  let finalizados = 0
  for (const p of participantes ?? []) {
    const { error } = await admin
      .from('quiz_participantes')
      .update({ concluido: true, pontuacao_total: totais.get(p.id) ?? 0 })
      .eq('id', p.id)
    if (!error) finalizados++
  }

  return NextResponse.json({ ok: true, finalizados })
}
