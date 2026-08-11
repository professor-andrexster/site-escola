import { NextResponse } from 'next/server'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { calcularDiasAtraso } from '@/lib/biblioteca/emprestimos'
import { configuracao, devolver, emprestimoAtivoDoExemplar } from '@/lib/db/biblioteca'

type CorpoDevolucao = {
  exemplarId?: string
  dano?: boolean
  observacaoDano?: string
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CorpoDevolucao
  if (!body.exemplarId) {
    return NextResponse.json({ error: 'Exemplar não informado.' }, { status: 400 })
  }

  // O atraso e calculado aqui, fora da transacao, porque depende da regra de
  // negocio (calcularDiasAtraso trata a data prevista como fim do dia) e nao
  // do banco.
  const emprestimo = await emprestimoAtivoDoExemplar(body.exemplarId)
  if (!emprestimo) {
    return NextResponse.json(
      { error: 'Este exemplar não está emprestado no momento.' },
      { status: 400 }
    )
  }

  const config = await configuracao()
  const diasAtraso = emprestimo.data_prevista
    ? calcularDiasAtraso(emprestimo.data_prevista.toISOString().slice(0, 10))
    : 0

  try {
    const resultado = await devolver({
      exemplarId: body.exemplarId,
      devolvidoPor: auth.userId,
      diasAtraso,
      dano: body.dano,
      observacaoDano: body.observacaoDano ?? null,
      prazoValidadeReservaDias: config?.prazo_validade_reserva_dias ?? 2,
      diasSuspensaoPorAtraso: config?.dias_suspensao_por_atraso ?? 0,
    })

    return NextResponse.json({ ok: true, diasAtraso, ...resultado })
  } catch (erro) {
    // A transacao nao gravou nada — nem o emprestimo fechado, nem o exemplar
    // liberado. O balcao pode tentar de novo sem estado pela metade.
    console.error('[biblioteca/devolucao] falha', erro)
    const mensagem = erro instanceof Error ? erro.message : 'Erro ao registrar a devolução.'
    return NextResponse.json({ error: mensagem }, { status: 400 })
  }
}
