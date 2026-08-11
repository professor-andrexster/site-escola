import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { criarPerguntasEmSequencia } from '@/lib/db/quiz'
import { lerCorpoDePergunta } from '../../corpo'

/**
 * Cria uma pergunta, ou um lote (`{ perguntas: [...] }`) — e o que a geracao
 * por IA envia. A ordem e atribuida no servidor, a partir da ultima gravada.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res
  const { id: quizId } = await params

  const body = (await request.json()) as Record<string, unknown>
  const brutas = Array.isArray(body.perguntas) ? body.perguntas : [body]

  const lote = []
  for (const bruta of brutas) {
    const lida = lerCorpoDePergunta(bruta)
    if ('erro' in lida) return NextResponse.json({ error: lida.erro }, { status: 400 })
    lote.push(lida.dados)
  }
  if (!lote.length) return NextResponse.json({ error: 'Nenhuma pergunta enviada.' }, { status: 400 })

  try {
    const perguntas = await criarPerguntasEmSequencia(quizId, lote)
    return NextResponse.json({ perguntas })
  } catch (erro) {
    console.error('[quiz/:id/perguntas] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao salvar as perguntas.' }, { status: 400 })
  }
}
