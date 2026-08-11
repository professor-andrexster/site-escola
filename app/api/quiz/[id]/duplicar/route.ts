import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { codigoLivre, duplicarQuiz } from '@/lib/db/quiz'
import { gerarCodigo } from '../../codigo'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res
  const { id } = await params

  try {
    const novo = await duplicarQuiz(id, await codigoLivre(gerarCodigo))
    return NextResponse.json({ id: novo.id })
  } catch (erro) {
    console.error('[quiz/:id/duplicar] falha', erro)
    return NextResponse.json({ error: 'Erro ao duplicar o quiz.' }, { status: 400 })
  }
}
