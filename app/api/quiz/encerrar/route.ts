import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { encerrar } from '@/lib/db/quiz'

// Encerra a rodada e consolida a pontuacao de cada participante.
export async function POST(request: Request) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res

  const { quizId } = (await request.json()) as { quizId?: string }
  if (!quizId) return NextResponse.json({ error: 'Quiz não informado.' }, { status: 400 })

  try {
    const { participantes } = await encerrar(quizId)
    return NextResponse.json({ ok: true, participantes })
  } catch (erro) {
    console.error('[quiz/encerrar] falha', erro)
    return NextResponse.json({ error: 'Erro ao encerrar o quiz.' }, { status: 400 })
  }
}
