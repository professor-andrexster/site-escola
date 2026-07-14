import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirDirecao } from '@/lib/apiDirecao'

export async function POST(request: Request) {
  const auth = await exigirDirecao()
  if (!auth.ok) return auth.res

  const { cursoId } = await request.json() as { cursoId?: string }

  if (!cursoId) {
    return NextResponse.json({ error: 'Curso não informado.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('cursos')
    .update({ publicado: true, atualizado_em: new Date().toISOString() })
    .eq('id', cursoId)

  if (error) {
    return NextResponse.json({ error: 'Erro ao aprovar: ' + error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
