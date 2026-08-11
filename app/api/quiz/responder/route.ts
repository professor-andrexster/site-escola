import { NextResponse } from 'next/server'
import { responder } from '@/lib/db/quiz'
import { participacaoPermitida } from '../participacao'

const ALTERNATIVAS = ['a', 'b', 'c', 'd']

/**
 * Grava a resposta. Quem corrige e pontua e o servidor.
 *
 * Antes o navegador mandava `correta` e `pontos_obtidos` prontos: um POST
 * forjado dava ao aluno a nota que ele quisesse, e nada conferia. Agora o
 * cliente informa so a alternativa e o tempo.
 */
export async function POST(request: Request) {
  const { participanteId, perguntaId, resposta, tempoResposta } = (await request.json()) as {
    participanteId?: string; perguntaId?: string; resposta?: string | null; tempoResposta?: number
  }
  if (!participanteId || !perguntaId) {
    return NextResponse.json({ error: 'Participação ou pergunta não informada.' }, { status: 400 })
  }
  if (resposta != null && !ALTERNATIVAS.includes(resposta)) {
    return NextResponse.json({ error: 'Alternativa inválida.' }, { status: 400 })
  }

  const permissao = await participacaoPermitida(participanteId)
  if ('erro' in permissao) return permissao.erro

  try {
    const { correta } = await responder({
      participanteId,
      perguntaId,
      resposta: (resposta ?? null) as 'a' | 'b' | 'c' | 'd' | null,
      tempoResposta: typeof tempoResposta === 'number' ? tempoResposta : null,
    })
    return NextResponse.json({ correta })
  } catch (erro) {
    console.error('[quiz/responder] falha', erro)
    return NextResponse.json({ error: 'Erro ao registrar a resposta.' }, { status: 400 })
  }
}
