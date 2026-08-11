import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { atualizarQuiz, remover } from '@/lib/db/quiz'
import { lerCorpoDeQuiz } from '../corpo'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res
  const { id } = await params

  const corpo = lerCorpoDeQuiz(await request.json())
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })

  try {
    await atualizarQuiz(id, corpo.dados)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[quiz/:id] falha ao atualizar', erro)
    return NextResponse.json({ error: 'Erro ao salvar o quiz.' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res
  const { id } = await params

  try {
    await remover(id)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[quiz/:id] falha ao remover', erro)
    return NextResponse.json({ error: 'Erro ao remover o quiz.' }, { status: 400 })
  }
}
