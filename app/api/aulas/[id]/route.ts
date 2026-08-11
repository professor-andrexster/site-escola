import { NextResponse } from 'next/server'
import { exigirProfessorOrAbove } from '@/lib/apiGestao'
import { alternarAulaPublicada, atualizarAula, removerAula } from '@/lib/db/cursos'
import { lerCorpoDeAula } from '../corpo'

type Ctx = { params: Promise<{ id: string }> }

/** Edita a aula, ou so alterna a publicacao quando o corpo tem so isso. */
export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await exigirProfessorOrAbove()
  if (!auth.ok) return auth.res
  const { id } = await params

  const body = (await request.json()) as Record<string, unknown>

  if (Object.keys(body).length === 1 && typeof body.publicado === 'boolean') {
    await alternarAulaPublicada(id, body.publicado)
    return NextResponse.json({ ok: true })
  }

  const corpo = lerCorpoDeAula(body)
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })

  try {
    await atualizarAula(id, corpo.dados)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma aula com esse slug neste curso.' }, { status: 409 })
    }
    console.error('[aulas/:id] falha ao atualizar', erro)
    return NextResponse.json({ error: 'Erro ao salvar a aula.' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await exigirProfessorOrAbove()
  if (!auth.ok) return auth.res
  const { id } = await params

  try {
    await removerAula(id)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[aulas/:id] falha ao remover', erro)
    return NextResponse.json({ error: 'Erro ao remover a aula.' }, { status: 400 })
  }
}
