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

  // Deletar curso e todas as aulas/desafios associados (via cascade)
  const { error } = await admin
    .from('cursos')
    .delete()
    .eq('id', cursoId)

  if (error) {
    return NextResponse.json({ error: 'Erro ao rejeitar: ' + error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
