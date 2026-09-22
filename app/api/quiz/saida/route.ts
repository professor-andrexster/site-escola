import { NextResponse } from 'next/server'
import { buscarPorId, registrarSaidaDeTela } from '@/lib/db/quiz'
import { participacaoPermitida } from '../participacao'

/**
 * Trava anti-cola: a tela do aluno avisa que ele saiu da tela cheia ou trocou
 * de aba. So conta enquanto o quiz esta rodando; no lobby e depois do fim,
 * sair da tela nao e cola.
 */
export async function POST(request: Request) {
  const { participanteId } = (await request.json().catch(() => ({}))) as { participanteId?: string }
  if (!participanteId) {
    return NextResponse.json({ error: 'Participação não informada.' }, { status: 400 })
  }

  const permissao = await participacaoPermitida(participanteId)
  if ('erro' in permissao) return permissao.erro

  const quiz = await buscarPorId(permissao.participante.quiz_id)
  if (!quiz?.ativo || quiz.encerrado) return NextResponse.json({ ok: true, contou: false })

  await registrarSaidaDeTela(participanteId)
  return NextResponse.json({ ok: true, contou: true })
}
