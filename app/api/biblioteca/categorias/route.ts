import { NextResponse } from 'next/server'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { categoriasAtivas, criarCategoria } from '@/lib/db/biblioteca'

export async function GET(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const busca = new URL(request.url).searchParams.get('q')?.trim()
  try {
    return NextResponse.json({ categorias: await categoriasAtivas(busca) })
  } catch (erro) {
    console.error('[biblioteca/categorias] falha ao listar', erro)
    return NextResponse.json({ error: 'Erro ao buscar categorias.' }, { status: 400 })
  }
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { nome } = (await request.json()) as { nome?: string }
  if (!nome?.trim()) {
    return NextResponse.json({ error: 'Informe o nome da categoria.' }, { status: 400 })
  }

  try {
    return NextResponse.json({ categoria: await criarCategoria(nome.trim(), auth.userId) })
  } catch (erro) {
    console.error('[biblioteca/categorias] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao criar categoria.' }, { status: 400 })
  }
}
