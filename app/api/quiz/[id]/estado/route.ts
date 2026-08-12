import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import {
  aplicarAcaoDeSala,
  buscarPorId,
  contarPerguntas,
  participante as buscarParticipante,
  participantesDoQuiz,
  type AcaoDeSala,
} from '@/lib/db/quiz'

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

/**
 * Estado da sala, para quem esta dentro dela.
 *
 * Substitui a subscricao Realtime do Supabase. A tela pergunta a cada poucos
 * segundos em vez de receber o aviso — e o quiz avanca quando o professor
 * manda, com atraso de no maximo um intervalo.
 *
 * Foi escolhido no lugar de WebSocket ou SSE por causa do modo de falhar: os
 * dois dependem de configuracao no nginx (upgrade de conexao, proxy_buffering
 * off) que, se faltar na virada, quebra em silencio — e essa quebra acontece
 * com a turma inteira olhando o telao. Requisicao HTTP comum nao tem esse
 * modo de falha. Sao ~40 alunos por sala, uma consulta leve cada.
 *
 * Devolve tambem a lista do lobby quando pedida, para a tela do aluno fazer
 * UMA requisicao por rodada em vez de duas.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const participanteId = new URL(request.url).searchParams.get('participanteId')

  // Quem esta na sala se identifica pela participacao; a equipe do quiz, pela
  // sessao. Sem um dos dois, o estado da sala nao sai.
  if (participanteId) {
    const eu = await buscarParticipante(participanteId)
    if (!eu || eu.quiz_id !== id) {
      return NextResponse.json({ error: 'Participação inválida.' }, { status: 403 })
    }
  } else {
    const auth = await exigirQuizStaff()
    if (!auth.ok) return auth.res
  }

  const quiz = await buscarPorId(id)
  if (!quiz) return NextResponse.json({ error: 'Quiz não encontrado.' }, { status: 404 })

  return NextResponse.json({
    quiz: {
      lobby_aberto: quiz.lobby_aberto,
      ativo: quiz.ativo,
      encerrado: quiz.encerrado,
      quiz_iniciado_em: quiz.quiz_iniciado_em,
      pergunta_atual: quiz.pergunta_atual,
      pergunta_liberada_em: quiz.pergunta_liberada_em,
      resposta_revelada: quiz.resposta_revelada,
      tempo_por_pergunta: quiz.tempo_por_pergunta,
    },
    // So faz sentido na espera; durante o jogo a tela nem mostra a lista.
    participantes: quiz.ativo ? [] : await participantesDoQuiz(id),
  })
}
