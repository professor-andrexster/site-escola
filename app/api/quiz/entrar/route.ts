import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { buscarPorCodigo, entrarNaSala } from '@/lib/db/quiz'
import { papelEAprovacao } from '@/lib/db/perfis'

/**
 * Entrada na sala pelo codigo.
 *
 * O vinculo com a conta sai da sessao, nunca do corpo: a tela mandava
 * `user_id`, e mandar o id de outra pessoa bastava para lancar a participacao
 * — e a pontuacao — no nome dela.
 */
export async function POST(request: Request) {
  const { codigo, nome, turma } = (await request.json()) as {
    codigo?: string; nome?: string; turma?: string
  }
  if (!codigo?.trim()) return NextResponse.json({ error: 'Informe o código do quiz.' }, { status: 400 })
  if (!nome?.trim()) return NextResponse.json({ error: 'Informe seu nome.' }, { status: 400 })
  if (!turma?.trim()) return NextResponse.json({ error: 'Informe sua turma.' }, { status: 400 })

  const quiz = await buscarPorCodigo(codigo.trim().toUpperCase())
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz não encontrado. Verifique o código.' }, { status: 404 })
  }
  if (quiz.encerrado) {
    return NextResponse.json({ error: 'Este quiz foi encerrado.' }, { status: 409 })
  }
  if (!quiz.lobby_aberto && !quiz.ativo) {
    return NextResponse.json({ error: 'A sala ainda não foi aberta. Aguarde o professor.' }, { status: 409 })
  }

  // Conta aprovada entra vinculada; visitante entra solto, como antes.
  const usuario = await usuarioAtual()
  const perfil = usuario ? await papelEAprovacao(usuario.id) : null
  const userId = perfil?.aprovado ? usuario!.id : null

  try {
    const participante = await entrarNaSala({
      quizId: quiz.id,
      nome: nome.trim(),
      turma: turma.trim(),
      userId,
    })
    return NextResponse.json({
      participanteId: participante.id,
      concluido: participante.concluido,
      codigo: quiz.codigo,
    })
  } catch (erro) {
    console.error('[quiz/entrar] falha', erro)
    return NextResponse.json({ error: 'Erro ao entrar no quiz. Tente novamente.' }, { status: 400 })
  }
}
