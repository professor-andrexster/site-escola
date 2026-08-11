import { NextResponse } from 'next/server'
import { definirPapel, equipeComMembros, equipeDoMembro } from '@/lib/db/desafios'
import { autorAprovado, podeAvaliar } from '../../permissao'

/**
 * Define o papel de um integrante. Quem pode: a propria pessoa, ou quem avalia
 * o desafio. Antes qualquer sessao podia reescrever o papel de qualquer um.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const autor = await autorAprovado()
  if (!autor) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const { id } = await params
  const membro = await equipeDoMembro(id)
  if (!membro) return NextResponse.json({ error: 'Integrante não encontrado.' }, { status: 404 })

  if (membro.profile_id !== autor.id) {
    const equipe = await equipeComMembros(membro.equipe_id)
    if (!equipe || !(await podeAvaliar(equipe.desafio_id, autor))) {
      return NextResponse.json({ error: 'Sem permissão sobre esse integrante.' }, { status: 403 })
    }
  }

  const { papelId } = (await request.json()) as { papelId?: string | null }

  try {
    await definirPapel(id, papelId || null)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[desafios/membros/:id] falha', erro)
    return NextResponse.json({ error: 'Erro ao definir o papel.' }, { status: 400 })
  }
}
