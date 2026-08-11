import { NextResponse } from 'next/server'
import { avaliarEntrega, equipeComMembros, faseDoDesafio } from '@/lib/db/desafios'
import { autorAprovado, podeAvaliar } from '../permissao'

/**
 * Nota e feedback de uma entrega — so a gestao ou o professor dono do desafio.
 *
 * Era o mesmo upsert que a equipe usava para entregar, com dois campos a mais.
 * Um aluno com o console aberto dava nota a propria equipe.
 */
export async function POST(request: Request) {
  const autor = await autorAprovado()
  if (!autor) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const b = (await request.json()) as Record<string, unknown>
  const equipeId = typeof b.equipeId === 'string' ? b.equipeId : ''
  const faseId = typeof b.faseId === 'string' ? b.faseId : ''
  if (!equipeId || !faseId) {
    return NextResponse.json({ error: 'Equipe ou fase não informada.' }, { status: 400 })
  }

  const [equipe, fase] = await Promise.all([equipeComMembros(equipeId), faseDoDesafio(faseId)])
  if (!equipe || !fase) return NextResponse.json({ error: 'Equipe ou fase não encontrada.' }, { status: 404 })
  if (fase.desafio_id !== equipe.desafio_id) {
    return NextResponse.json({ error: 'Essa fase não é deste desafio.' }, { status: 400 })
  }
  if (!(await podeAvaliar(equipe.desafio_id, autor))) {
    return NextResponse.json({ error: 'Só o professor do desafio avalia.' }, { status: 403 })
  }

  const nota = b.nota == null || b.nota === '' ? null : Number(b.nota)
  if (nota !== null && (!Number.isFinite(nota) || nota < 0 || nota > (fase.pontos_max ?? 100))) {
    return NextResponse.json(
      { error: `A nota precisa ficar entre 0 e ${fase.pontos_max ?? 100}.` },
      { status: 400 }
    )
  }

  try {
    await avaliarEntrega({
      equipeId,
      faseId,
      nota,
      feedback: typeof b.feedback === 'string' && b.feedback.trim() ? b.feedback.trim() : null,
    })
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[desafios/avaliacoes] falha', erro)
    return NextResponse.json({ error: 'Erro ao salvar a avaliação.' }, { status: 400 })
  }
}
