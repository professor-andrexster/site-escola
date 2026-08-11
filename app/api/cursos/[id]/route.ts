import { NextResponse } from 'next/server'
import { exigirGestao, exigirProfessorOrAbove } from '@/lib/apiGestao'
import { alternarPublicado, atualizarCurso, remover } from '@/lib/db/cursos'
import { isGestao } from '@/lib/roles'
import { lerCorpoDeCurso } from '../corpo'

type Ctx = { params: Promise<{ id: string }> }

/**
 * Edita o curso, ou so alterna a publicacao quando o corpo traz apenas
 * `publicado` — a listagem usa esse atalho no botao de olho.
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await exigirProfessorOrAbove()
  if (!auth.ok) return auth.res
  const { id } = await params

  const body = (await request.json()) as Record<string, unknown>

  // Publicar e despublicar continua sendo decisao da direcao.
  if (Object.keys(body).length === 1 && typeof body.publicado === 'boolean') {
    if (!isGestao(auth.role)) {
      return NextResponse.json({ error: 'Apenas a direção publica cursos.' }, { status: 403 })
    }
    await alternarPublicado(id, body.publicado)
    return NextResponse.json({ ok: true })
  }

  const corpo = lerCorpoDeCurso(body)
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })

  const { publicado, ...campos } = corpo.dados
  try {
    await atualizarCurso(id, isGestao(auth.role) ? { ...campos, publicado } : campos)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um curso com esse slug.' }, { status: 409 })
    }
    console.error('[cursos/:id] falha ao atualizar', erro)
    return NextResponse.json({ error: 'Erro ao salvar o curso.' }, { status: 400 })
  }
}

/** Apagar leva junto aulas, progresso e certificados: so a gestao. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res
  const { id } = await params

  try {
    await remover(id)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[cursos/:id] falha ao remover', erro)
    return NextResponse.json({ error: 'Erro ao remover o curso.' }, { status: 400 })
  }
}
