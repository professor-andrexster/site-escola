import { NextResponse } from 'next/server'
import { exigirProfessorOrAbove } from '@/lib/apiGestao'
import { contarAulas, criarAula } from '@/lib/db/cursos'
import { lerCorpoDeAula } from '@/app/api/aulas/corpo'

/**
 * Cria a aula no fim da lista. A ordem e calculada aqui, e nao enviada pela
 * tela: duas pessoas criando aula ao mesmo tempo mandariam o mesmo numero.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirProfessorOrAbove()
  if (!auth.ok) return auth.res
  const { id: cursoId } = await params

  const corpo = lerCorpoDeAula(await request.json())
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })

  try {
    const aula = await criarAula({ ...corpo.dados, cursoId, ordem: (await contarAulas(cursoId)) + 1 })
    return NextResponse.json({ id: aula.id })
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma aula com esse slug neste curso.' }, { status: 409 })
    }
    console.error('[cursos/:id/aulas] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao criar a aula.' }, { status: 400 })
  }
}
