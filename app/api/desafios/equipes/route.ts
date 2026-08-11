import { NextResponse } from 'next/server'
import { criarEquipe, entrarNaEquipe, equipeComMembros } from '@/lib/db/desafios'
import { autorAprovado, podeAvaliar } from '../permissao'

/**
 * Monta uma equipe (professor ou gestao) ou entra numa que ja existe (aluno e
 * monitor, so por si mesmos).
 *
 * Antes os dois casos eram inserts diretos com `profile_id` escolhido pelo
 * navegador: dava para inscrever qualquer aluno em qualquer equipe.
 */
export async function POST(request: Request) {
  const autor = await autorAprovado()
  if (!autor) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const b = (await request.json()) as Record<string, unknown>

  // Entrar numa equipe existente: sempre em nome de quem esta na sessao.
  if (typeof b.equipeId === 'string') {
    if (autor.role !== 'aluno' && autor.role !== 'monitor') {
      return NextResponse.json({ error: 'Só aluno entra em equipe.' }, { status: 403 })
    }
    const equipe = await equipeComMembros(b.equipeId)
    if (!equipe) return NextResponse.json({ error: 'Equipe não encontrada.' }, { status: 404 })

    try {
      await entrarNaEquipe(equipe.id, autor.id)
      return NextResponse.json({ ok: true })
    } catch (erro) {
      if ((erro as { code?: string })?.code === 'P2002') {
        return NextResponse.json({ error: 'Você já está nessa equipe.' }, { status: 409 })
      }
      console.error('[desafios/equipes] falha ao entrar', erro)
      return NextResponse.json({ error: 'Erro ao entrar na equipe.' }, { status: 400 })
    }
  }

  // Criar equipe com integrantes: so quem avalia aquele desafio.
  const desafioId = typeof b.desafioId === 'string' ? b.desafioId : ''
  if (!desafioId) return NextResponse.json({ error: 'Desafio não informado.' }, { status: 400 })
  if (!(await podeAvaliar(desafioId, autor))) {
    return NextResponse.json({ error: 'Sem permissão neste desafio.' }, { status: 403 })
  }

  const membros = Array.isArray(b.membros) ? b.membros.filter((m): m is string => typeof m === 'string') : []

  try {
    const equipe = await criarEquipe({
      desafioId,
      nomeEmpresa: typeof b.nomeEmpresa === 'string' && b.nomeEmpresa.trim() ? b.nomeEmpresa.trim() : null,
      ideiaId: typeof b.ideiaId === 'string' && b.ideiaId ? b.ideiaId : null,
      turma: typeof b.turma === 'string' && b.turma ? b.turma : null,
      membros,
    })
    return NextResponse.json({ id: equipe.id })
  } catch (erro) {
    console.error('[desafios/equipes] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao criar a equipe.' }, { status: 400 })
  }
}
