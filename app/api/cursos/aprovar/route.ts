import { NextResponse } from 'next/server'
import { alternarPublicado } from '@/lib/db/cursos'
import { exigirGestao } from '@/lib/apiGestao'

export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { cursoId } = await request.json() as { cursoId?: string }

  if (!cursoId) {
    return NextResponse.json({ error: 'Curso não informado.' }, { status: 400 })
  }

  try {
    await alternarPublicado(cursoId, true)
  } catch (erro) {
    console.error('[cursos/aprovar] falha', erro)
    return NextResponse.json({ error: 'Erro ao aprovar o curso.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
