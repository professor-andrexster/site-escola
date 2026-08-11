import { NextResponse } from 'next/server'
import { enviarEntrega, equipeComMembros, faseDoDesafio } from '@/lib/db/desafios'
import { autorAprovado, podeAvaliar } from '../permissao'

/**
 * Entrega de uma fase. Quem entrega: integrante da equipe, ou quem avalia o
 * desafio.
 *
 * O corpo nao carrega nota nem status: a tela mandava `status: 'entregue'`
 * junto, e o mesmo upsert servia para entregar e para avaliar — bastava
 * acrescentar `nota` ao objeto. Aqui sao duas rotas separadas, e esta nao
 * escreve nota.
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
  // A fase tem que ser do mesmo desafio da equipe.
  if (fase.desafio_id !== equipe.desafio_id) {
    return NextResponse.json({ error: 'Essa fase não é deste desafio.' }, { status: 400 })
  }

  const integrante = equipe.equipe_membros.some(m => m.profile_id === autor.id)
  if (!integrante && !(await podeAvaliar(equipe.desafio_id, autor))) {
    return NextResponse.json({ error: 'Você não é dessa equipe.' }, { status: 403 })
  }

  const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

  try {
    await enviarEntrega({
      equipeId,
      faseId,
      conteudo: texto(b.conteudo),
      linkUrl: texto(b.linkUrl),
      arquivoUrl: texto(b.arquivoUrl),
    })
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[desafios/entregas] falha', erro)
    return NextResponse.json({ error: 'Erro ao enviar a entrega.' }, { status: 400 })
  }
}
