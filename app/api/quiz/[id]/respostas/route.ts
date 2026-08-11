import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { contagemDeRespostas, quizDaPergunta } from '@/lib/db/quiz'

/** Distribuicao das respostas da pergunta atual — so o telao do professor ve. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res
  const { id } = await params

  const perguntaId = new URL(request.url).searchParams.get('perguntaId')
  if (!perguntaId) return NextResponse.json({ error: 'Pergunta não informada.' }, { status: 400 })
  if ((await quizDaPergunta(perguntaId)) !== id) {
    return NextResponse.json({ error: 'Pergunta não é deste quiz.' }, { status: 400 })
  }

  return NextResponse.json(await contagemDeRespostas(perguntaId))
}
