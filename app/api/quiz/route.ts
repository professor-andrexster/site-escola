import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { codigoLivre, criarQuiz } from '@/lib/db/quiz'
import { gerarCodigo } from './codigo'
import { lerCorpoDeQuiz } from './corpo'

export async function POST(request: Request) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res

  const corpo = lerCorpoDeQuiz(await request.json())
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })

  try {
    // O codigo e sorteado no servidor e conferido contra os existentes. A tela
    // sorteava sem conferir, e duas salas podiam nascer com o mesmo codigo.
    const quiz = await criarQuiz(corpo.dados, await codigoLivre(gerarCodigo))
    return NextResponse.json({ id: quiz.id })
  } catch (erro) {
    console.error('[quiz] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao criar o quiz.' }, { status: 400 })
  }
}
