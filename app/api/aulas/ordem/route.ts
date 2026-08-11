import { NextResponse } from 'next/server'
import { exigirProfessorOrAbove } from '@/lib/apiGestao'
import { cursoDaAula, trocarOrdemAulas } from '@/lib/db/cursos'

/**
 * Troca a posicao de duas aulas. A tela mandava dois UPDATEs soltos em
 * paralelo; aqui e uma transacao, e as duas aulas precisam ser do mesmo curso —
 * sem essa checagem daria para embaralhar a ordem de um curso alheio.
 */
export async function POST(request: Request) {
  const auth = await exigirProfessorOrAbove()
  if (!auth.ok) return auth.res

  const { aulaA, ordemA, aulaB, ordemB } = (await request.json()) as {
    aulaA?: string; ordemA?: number; aulaB?: string; ordemB?: number
  }
  if (!aulaA || !aulaB || typeof ordemA !== 'number' || typeof ordemB !== 'number') {
    return NextResponse.json({ error: 'Aulas não informadas.' }, { status: 400 })
  }

  const [cursoA, cursoB] = await Promise.all([cursoDaAula(aulaA), cursoDaAula(aulaB)])
  if (!cursoA || cursoA !== cursoB) {
    return NextResponse.json({ error: 'As aulas não são do mesmo curso.' }, { status: 400 })
  }

  try {
    await trocarOrdemAulas(aulaA, ordemA, aulaB, ordemB)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[aulas/ordem] falha', erro)
    return NextResponse.json({ error: 'Erro ao reordenar as aulas.' }, { status: 400 })
  }
}
