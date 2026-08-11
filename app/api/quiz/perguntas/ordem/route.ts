import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { quizDaPergunta, trocarOrdem } from '@/lib/db/quiz'

export async function POST(request: Request) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res

  const { perguntaA, ordemA, perguntaB, ordemB } = (await request.json()) as {
    perguntaA?: string; ordemA?: number; perguntaB?: string; ordemB?: number
  }
  if (!perguntaA || !perguntaB || typeof ordemA !== 'number' || typeof ordemB !== 'number') {
    return NextResponse.json({ error: 'Perguntas não informadas.' }, { status: 400 })
  }

  const [quizA, quizB] = await Promise.all([quizDaPergunta(perguntaA), quizDaPergunta(perguntaB)])
  if (!quizA || quizA !== quizB) {
    return NextResponse.json({ error: 'As perguntas não são do mesmo quiz.' }, { status: 400 })
  }

  try {
    await trocarOrdem(perguntaA, ordemA, perguntaB, ordemB)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[quiz/perguntas/ordem] falha', erro)
    return NextResponse.json({ error: 'Erro ao reordenar as perguntas.' }, { status: 400 })
  }
}
