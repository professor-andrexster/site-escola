import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { registrarAuditoriaBiblioteca } from '@/lib/biblioteca/auditoria'

export async function GET() {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const admin = createAdminClient()
  const { data: dias, error } = await admin.from('biblioteca_calendario').select('*').order('data')
  if (error) return NextResponse.json({ error: 'Erro ao buscar o calendário.' }, { status: 400 })
  return NextResponse.json({ dias })
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { data, motivo } = (await request.json()) as { data?: string; motivo?: string }
  if (!data || !motivo?.trim()) return NextResponse.json({ error: 'Informe a data e o motivo.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: dia, error } = await admin
    .from('biblioteca_calendario')
    .insert({ data, motivo: motivo.trim(), criado_por: auth.userId })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Essa data já está cadastrada no calendário.' }, { status: 400 })
    return NextResponse.json({ error: 'Erro ao salvar: ' + error.message }, { status: 400 })
  }

  await registrarAuditoriaBiblioteca(admin, {
    usuarioId: auth.userId,
    acao: 'calendario_dia_adicionado',
    tabelaAfetada: 'biblioteca_calendario',
    registroAfetado: dia.id,
    valorNovo: dia,
  })

  return NextResponse.json({ dia })
}
