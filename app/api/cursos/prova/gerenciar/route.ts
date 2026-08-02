import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirProfessorOuGestao } from '@/lib/apiGestao'

type PerguntaEntrada = {
  enunciado?: string
  alternativa_a?: string
  alternativa_b?: string
  alternativa_c?: string
  alternativa_d?: string
  resposta_correta?: string
}

// Leitura completa (com gabarito) para quem monta a prova. O aluno nunca
// passa por aqui: a rota dele (../route.ts) entrega sem resposta_correta.
export async function GET(request: Request) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const cursoId = new URL(request.url).searchParams.get('cursoId')
  if (!cursoId) return NextResponse.json({ error: 'Curso não informado.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: perguntas, error } = await admin
    .from('curso_prova_perguntas')
    .select('*')
    .eq('curso_id', cursoId)
    .order('ordem')

  if (error) return NextResponse.json({ error: 'Erro ao carregar a prova.' }, { status: 400 })
  return NextResponse.json({ perguntas: perguntas ?? [] })
}

// Salva a prova inteira de uma vez (apaga e regrava, na ordem enviada).
export async function POST(request: Request) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const { cursoId, perguntas } = (await request.json()) as { cursoId?: string; perguntas?: PerguntaEntrada[] }
  if (!cursoId || !Array.isArray(perguntas)) {
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
  }

  for (let i = 0; i < perguntas.length; i++) {
    const p = perguntas[i]
    if (!p.enunciado?.trim() || !p.alternativa_a?.trim() || !p.alternativa_b?.trim() || !p.alternativa_c?.trim() || !p.alternativa_d?.trim()) {
      return NextResponse.json({ error: `Pergunta ${i + 1}: preencha o enunciado e as quatro alternativas.` }, { status: 400 })
    }
    if (!['a', 'b', 'c', 'd'].includes(p.resposta_correta ?? '')) {
      return NextResponse.json({ error: `Pergunta ${i + 1}: marque qual alternativa é a correta.` }, { status: 400 })
    }
  }

  const admin = createAdminClient()
  const { error: delError } = await admin.from('curso_prova_perguntas').delete().eq('curso_id', cursoId)
  if (delError) return NextResponse.json({ error: 'Erro ao salvar: ' + delError.message }, { status: 400 })

  if (perguntas.length > 0) {
    const { error } = await admin.from('curso_prova_perguntas').insert(
      perguntas.map((p, i) => ({
        curso_id: cursoId,
        enunciado: p.enunciado!.trim(),
        alternativa_a: p.alternativa_a!.trim(),
        alternativa_b: p.alternativa_b!.trim(),
        alternativa_c: p.alternativa_c!.trim(),
        alternativa_d: p.alternativa_d!.trim(),
        resposta_correta: p.resposta_correta,
        ordem: i,
      }))
    )
    if (error) return NextResponse.json({ error: 'Erro ao salvar: ' + error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, total: perguntas.length })
}
