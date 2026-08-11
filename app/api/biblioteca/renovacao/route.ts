import { NextResponse } from 'next/server'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import {
  configuracao,
  diasSemExpediente as buscarDiasSemExpediente,
  emprestimoParaRenovar,
  renovar,
  reservasNaFila,
} from '@/lib/db/biblioteca'
import { calcularDataPrevista, motivoBloqueioLeitor, prazoDiasPorTipo } from '@/lib/biblioteca/emprestimos'
import type { BibliotecaLeitor } from '@/types/database'

type CorpoRenovacao = { emprestimoId?: string }

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CorpoRenovacao
  if (!body.emprestimoId) {
    return NextResponse.json({ error: 'Empréstimo não informado.' }, { status: 400 })
  }

  const emprestimo = await emprestimoParaRenovar(body.emprestimoId)
  if (!emprestimo) {
    return NextResponse.json(
      { error: 'Empréstimo não encontrado ou já foi devolvido.' },
      { status: 404 }
    )
  }

  const leitor = emprestimo.biblioteca_leitores as unknown as BibliotecaLeitor | null
  const motivoBloqueio = leitor ? motivoBloqueioLeitor(leitor) : null
  if (motivoBloqueio) return NextResponse.json({ error: motivoBloqueio }, { status: 400 })

  // As quatro recusas de negocio, na ordem em que o balcao as encontra.
  const hoje = new Date()
  if (emprestimo.data_prevista && emprestimo.data_prevista < hoje) {
    return NextResponse.json(
      { error: 'Este empréstimo está atrasado. Registre a devolução antes de renovar.' },
      { status: 400 }
    )
  }

  const config = await configuracao()
  if (!config) {
    return NextResponse.json({ error: 'Configuração da biblioteca não encontrada.' }, { status: 500 })
  }

  const feitas = emprestimo.renovacoes_feitas ?? 0
  if (feitas >= config.max_renovacoes) {
    return NextResponse.json(
      { error: `Limite de ${config.max_renovacoes} renovação(ões) já atingido para este empréstimo.` },
      { status: 400 }
    )
  }

  // Fila de reserva vence renovacao: quem esta esperando tem precedencia
  // sobre quem ja esta com o livro.
  const obraId = emprestimo.biblioteca_exemplares?.obra_id
  if (obraId && (await reservasNaFila(obraId)) > 0) {
    return NextResponse.json(
      { error: 'Existe reserva na fila para esta obra. Não é possível renovar, o próximo leitor está esperando.' },
      { status: 400 }
    )
  }

  const feriados = new Set(
    (await buscarDiasSemExpediente()).map(d => d.toISOString().slice(0, 10))
  )
  const novaDataPrevista = calcularDataPrevista(
    hoje,
    prazoDiasPorTipo(config, leitor?.tipo_leitor ?? 'aluno'),
    feriados
  )

  try {
    const atualizado = await renovar({
      emprestimoId: emprestimo.id,
      dataPrevistaAnterior: emprestimo.data_prevista!,
      novaDataPrevista,
      renovacoesFeitas: feitas,
      autorizadoPor: auth.userId,
    })
    return NextResponse.json({
      emprestimo: atualizado,
      novaDataPrevista: novaDataPrevista.toISOString().slice(0, 10),
    })
  } catch (erro) {
    console.error('[biblioteca/renovacao] falha', erro)
    return NextResponse.json({ error: 'Erro ao renovar o empréstimo.' }, { status: 400 })
  }
}
