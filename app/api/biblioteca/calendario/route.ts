import { NextResponse } from 'next/server'
import { calendario, adicionarDiaSemExpediente } from '@/lib/db/biblioteca'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { registrarAuditoriaBiblioteca } from '@/lib/biblioteca/auditoria'

export async function GET() {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const dias = await calendario()
  return NextResponse.json({ dias })
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { data, motivo } = (await request.json()) as { data?: string; motivo?: string }
  if (!data || !motivo?.trim()) return NextResponse.json({ error: 'Informe a data e o motivo.' }, { status: 400 })

  let dia
  try {
    dia = await adicionarDiaSemExpediente({
      data: new Date(data),
      motivo: motivo.trim(),
      criadoPor: auth.userId,
    })
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'Essa data já está cadastrada no calendário.' }, { status: 400 })
    }
    console.error('[biblioteca/calendario] falha ao salvar', erro)
    return NextResponse.json({ error: 'Erro ao salvar o dia no calendário.' }, { status: 400 })
  }

  await registrarAuditoriaBiblioteca({
    usuarioId: auth.userId,
    acao: 'calendario_dia_adicionado',
    tabelaAfetada: 'biblioteca_calendario',
    registroAfetado: dia.id,
    valorNovo: dia,
  })

  return NextResponse.json({ dia })
}
