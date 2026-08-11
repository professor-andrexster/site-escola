import { NextResponse } from 'next/server'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { autoresAtivos, criarAutor } from '@/lib/db/biblioteca'

export async function GET(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const busca = new URL(request.url).searchParams.get('q')?.trim()
  try {
    return NextResponse.json({ autores: await autoresAtivos(busca) })
  } catch (erro) {
    console.error('[biblioteca/autores] falha ao listar', erro)
    return NextResponse.json({ error: 'Erro ao buscar autores.' }, { status: 400 })
  }
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { nome } = (await request.json()) as { nome?: string }
  if (!nome?.trim()) {
    return NextResponse.json({ error: 'Informe o nome do autor.' }, { status: 400 })
  }

  try {
    return NextResponse.json({ autor: await criarAutor(nome.trim(), auth.userId) })
  } catch (erro) {
    console.error('[biblioteca/autores] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao criar autor.' }, { status: 400 })
  }
}
