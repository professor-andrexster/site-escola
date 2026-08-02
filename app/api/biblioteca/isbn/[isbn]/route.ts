import { NextResponse } from 'next/server'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { buscarPorIsbn } from '@/lib/biblioteca/isbn'

export async function GET(request: Request, { params }: { params: Promise<{ isbn: string }> }) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { isbn } = await params
  const dados = await buscarPorIsbn(isbn)
  if (!dados) {
    return NextResponse.json({ error: 'Não encontramos esse ISBN. Preencha os dados manualmente.' }, { status: 404 })
  }
  return NextResponse.json({ dados })
}
