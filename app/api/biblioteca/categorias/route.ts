import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'

export async function GET(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const busca = new URL(request.url).searchParams.get('q')?.trim()
  const admin = createAdminClient()
  let query = admin.from('biblioteca_categorias').select('*').eq('ativo', true).order('nome')
  if (busca) query = query.ilike('nome', `%${busca}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Erro ao buscar categorias.' }, { status: 400 })
  return NextResponse.json({ categorias: data })
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { nome } = (await request.json()) as { nome?: string }
  if (!nome?.trim()) return NextResponse.json({ error: 'Informe o nome da categoria.' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('biblioteca_categorias')
    .insert({ nome: nome.trim(), atualizado_por: auth.userId })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Já existe uma categoria com esse nome.' }, { status: 400 })
    return NextResponse.json({ error: 'Erro ao criar categoria.' }, { status: 400 })
  }
  return NextResponse.json({ categoria: data })
}
