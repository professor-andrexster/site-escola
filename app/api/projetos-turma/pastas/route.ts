import { NextResponse } from 'next/server'
import { exigirProfessorOuGestao } from '@/lib/apiGestao'
import { criarPasta, seriesSemPasta, slugDaSerie } from '@/lib/db/projetos-turma'

/** Cria a pasta de uma serie. So series da escola (lib/turmas) sem pasta ainda. */
export async function POST(request: Request) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const serie = typeof b.serie === 'string' ? b.serie.trim() : ''
  const livres = await seriesSemPasta()
  if (!serie || !livres.includes(serie as (typeof livres)[number])) {
    return NextResponse.json({ error: 'Escolha uma série que ainda não tem pasta.' }, { status: 400 })
  }

  try {
    const pasta = await criarPasta(serie, auth.userId)
    return NextResponse.json({ ok: true, pasta, slug: slugDaSerie(pasta.serie) })
  } catch (erro) {
    console.error('[projetos-turma/pastas] falha', erro)
    return NextResponse.json({ error: 'Erro ao criar a pasta.' }, { status: 400 })
  }
}
