import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { aplicarAcaoDeSala, contarPerguntas, type AcaoDeSala } from '@/lib/db/quiz'

const ACOES: AcaoDeSala[] = ['abrir-sala', 'fechar-sala', 'iniciar', 'revelar', 'proxima']

/**
 * Comandos da sala. O telao mandava o objeto de colunas a atualizar, o que
 * dava ao navegador poder de escrever qualquer coluna de `quizzes`. Aqui e uma
 * acao nomeada, e o servidor decide o que ela muda.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res
  const { id } = await params

  const { acao, perguntaAtual } = (await request.json()) as {
    acao?: string; perguntaAtual?: number
  }
  if (!acao || !ACOES.includes(acao as AcaoDeSala)) {
    return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 })
  }

  if (acao === 'proxima') {
    const total = await contarPerguntas(id)
    if (typeof perguntaAtual !== 'number' || perguntaAtual < 0 || perguntaAtual >= total) {
      return NextResponse.json({ error: 'Não há próxima pergunta.' }, { status: 400 })
    }
  }

  try {
    await aplicarAcaoDeSala(id, acao as AcaoDeSala, perguntaAtual)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[quiz/:id/estado] falha', erro)
    return NextResponse.json({ error: 'Erro ao mudar o estado da sala.' }, { status: 400 })
  }
}
