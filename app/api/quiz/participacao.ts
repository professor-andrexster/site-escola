import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { participante as buscarParticipante } from '@/lib/db/quiz'

/**
 * Quem pode agir em nome de uma participacao.
 *
 * O quiz aceita quem nao tem conta — o professor passa o codigo e a turma
 * entra. Para essas participacoes, o id sorteado e a unica credencial, como
 * ja era no PostgREST.
 *
 * Quando a participacao ESTA ligada a uma conta, a sessao precisa bater. Sem
 * isso, conhecer o id de outro aluno bastaria para responder no lugar dele —
 * e o id circula na URL da sala.
 */
export async function participacaoPermitida(participanteId: string) {
  const p = await buscarParticipante(participanteId)
  if (!p) {
    return { erro: NextResponse.json({ error: 'Participação não encontrada.' }, { status: 404 }) }
  }
  if (p.user_id) {
    const usuario = await usuarioAtual()
    if (usuario?.id !== p.user_id) {
      return { erro: NextResponse.json({ error: 'Essa participação é de outra conta.' }, { status: 403 }) }
    }
  }
  return { participante: p }
}
