import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import {
  atualizarPergunta,
  quizDaPergunta,
  removerPergunta,
  renumerarPerguntas,
} from '@/lib/db/quiz'
import { lerCorpoDePergunta } from '../../corpo'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res
  const { id } = await params

  const corpo = lerCorpoDePergunta(await request.json())
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })

  try {
    const pergunta = await atualizarPergunta(id, corpo.dados)
    return NextResponse.json({ pergunta })
  } catch (erro) {
    console.error('[quiz/perguntas/:id] falha ao atualizar', erro)
    return NextResponse.json({ error: 'Erro ao salvar a pergunta.' }, { status: 400 })
  }
}

/** Remove e reenumera na sequencia — a tela fazia isso com N updates soltos. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res
  const { id } = await params

  const quizId = await quizDaPergunta(id)
  if (!quizId) return NextResponse.json({ error: 'Pergunta não encontrada.' }, { status: 404 })

  try {
    await removerPergunta(id)
    await renumerarPerguntas(quizId)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[quiz/perguntas/:id] falha ao remover', erro)
    return NextResponse.json({ error: 'Erro ao remover a pergunta.' }, { status: 400 })
  }
}
