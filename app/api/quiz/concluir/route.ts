import { NextResponse } from 'next/server'
import { concluirParticipacao } from '@/lib/db/quiz'
import { participacaoPermitida } from '../participacao'

/** Fecha a participacao. A soma sai das respostas gravadas, nao do cliente. */
export async function POST(request: Request) {
  const { participanteId } = (await request.json()) as { participanteId?: string }
  if (!participanteId) {
    return NextResponse.json({ error: 'Participação não informada.' }, { status: 400 })
  }

  const permissao = await participacaoPermitida(participanteId)
  if ('erro' in permissao) return permissao.erro

  try {
    const { total } = await concluirParticipacao(participanteId)
    return NextResponse.json({ total })
  } catch (erro) {
    console.error('[quiz/concluir] falha', erro)
    return NextResponse.json({ error: 'Erro ao finalizar o quiz.' }, { status: 400 })
  }
}
