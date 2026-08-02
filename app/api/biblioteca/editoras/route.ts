import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'

export async function GET(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const busca = new URL(request.url).searchParams.get('q')?.trim()
  const admin = createAdminClient()
  let query = admin.from('biblioteca_editoras').select('*').eq('ativo', true).order('nome')
  if (busca) query = query.ilike('nome', `%${busca}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Erro ao buscar editoras.' }, { status: 400 })
  return NextResponse.json({ editoras: data })
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { nome } = (await request.json()) as { nome?: string }
  if (!nome?.trim()) return NextResponse.json({ error: 'Informe o nome da editora.' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('biblioteca_editoras')
    .insert({ nome: nome.trim(), atualizado_por: auth.userId })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Erro ao criar editora.' }, { status: 400 })
  return NextResponse.json({ editora: data })
}
