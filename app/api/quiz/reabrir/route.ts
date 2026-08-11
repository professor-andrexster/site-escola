import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { reabrir } from '@/lib/db/quiz'

// Reabre um quiz que deu errado: apaga respostas e participantes da rodada
// e volta o quiz para a sala de espera, pronto para jogar de novo.
export async function POST(request: Request) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res

  const { quizId } = (await request.json()) as { quizId?: string }
  if (!quizId) return NextResponse.json({ error: 'Quiz não informado.' }, { status: 400 })

  try {
    await reabrir(quizId)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[quiz/reabrir] falha', erro)
    return NextResponse.json({ error: 'Erro ao reabrir o quiz.' }, { status: 400 })
  }
}
