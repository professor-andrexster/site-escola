import { NextResponse } from 'next/server'
import { participante as buscarParticipante, participantesDoQuiz } from '@/lib/db/quiz'

/**
 * Lista de quem esta na sala, para o lobby.
 *
 * Publica de proposito, como no PostgREST — mas so para quem ja entrou: e
 * preciso apresentar uma participacao daquele mesmo quiz. Sem isso, qualquer
 * um poderia varrer nome e turma dos alunos de todas as salas.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const participanteId = new URL(request.url).searchParams.get('participanteId')
  if (!participanteId) {
    return NextResponse.json({ error: 'Participação não informada.' }, { status: 400 })
  }

  const eu = await buscarParticipante(participanteId)
  if (!eu || eu.quiz_id !== id) {
    return NextResponse.json({ error: 'Participação inválida.' }, { status: 403 })
  }

  return NextResponse.json({ participantes: await participantesDoQuiz(id) })
}
