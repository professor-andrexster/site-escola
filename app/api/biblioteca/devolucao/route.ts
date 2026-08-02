import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { registrarAuditoriaBiblioteca } from '@/lib/biblioteca/auditoria'
import { calcularDiasAtraso } from '@/lib/biblioteca/emprestimos'

type CorpoDevolucao = {
  exemplarId?: string
  dano?: boolean
  observacaoDano?: string
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CorpoDevolucao
  if (!body.exemplarId) return NextResponse.json({ error: 'Exemplar não informado.' }, { status: 400 })

  const admin = createAdminClient()

  const { data: emprestimo } = await admin
    .from('biblioteca_emprestimos')
    .select('*, biblioteca_exemplares(*, biblioteca_obras(id, titulo)), biblioteca_leitores(id, nome_completo)')
    .eq('exemplar_id', body.exemplarId)
    .in('situacao', ['em_andamento', 'renovado'])
    .maybeSingle()

  if (!emprestimo) return NextResponse.json({ error: 'Este exemplar não está emprestado no momento.' }, { status: 400 })

  const exemplar = Array.isArray(emprestimo.biblioteca_exemplares) ? emprestimo.biblioteca_exemplares[0] : emprestimo.biblioteca_exemplares
  const leitor = Array.isArray(emprestimo.biblioteca_leitores) ? emprestimo.biblioteca_leitores[0] : emprestimo.biblioteca_leitores
  const obra = exemplar && (Array.isArray(exemplar.biblioteca_obras) ? exemplar.biblioteca_obras[0] : exemplar.biblioteca_obras)

  const agora = new Date()
  const diasAtraso = calcularDiasAtraso(emprestimo.data_prevista, agora)
  const atrasado = diasAtraso > 0
  const situacaoFinal = atrasado ? 'devolvido_com_atraso' : 'devolvido'

  const { error: errEmprestimo } = await admin
    .from('biblioteca_emprestimos')
    .update({
      situacao: situacaoFinal,
      data_devolucao: agora.toISOString(),
      devolvido_por: auth.userId,
      atualizado_em: agora.toISOString(),
    })
    .eq('id', emprestimo.id)

  if (errEmprestimo) return NextResponse.json({ error: 'Erro ao registrar devolução: ' + errEmprestimo.message }, { status: 400 })

  // Decide o proximo destino do exemplar: reparo se veio danificado, senao
  // reservado se houver fila de espera pela obra, senao disponivel.
  let novaSituacaoExemplar = 'disponivel'
  if (body.dano) {
    novaSituacaoExemplar = 'em_reparo'
  } else {
    const { data: proximaReserva } = await admin
      .from('biblioteca_reservas')
      .select('*')
      .eq('obra_id', obra?.id)
      .eq('situacao', 'aguardando')
      .order('posicao_fila')
      .limit(1)
      .maybeSingle()

    if (proximaReserva) {
      novaSituacaoExemplar = 'reservado'
      const { data: config } = await admin.from('biblioteca_configuracoes').select('prazo_validade_reserva_dias').eq('id', true).maybeSingle()
      const validade = new Date(agora)
      validade.setDate(validade.getDate() + (config?.prazo_validade_reserva_dias ?? 2))
      await admin.from('biblioteca_reservas').update({
        situacao: 'disponivel',
        validade: validade.toISOString().slice(0, 10),
        atualizado_em: agora.toISOString(),
      }).eq('id', proximaReserva.id)
    }
  }

  await admin.from('biblioteca_exemplares').update({
    situacao: novaSituacaoExemplar,
    observacoes: body.dano && body.observacaoDano ? body.observacaoDano : exemplar?.observacoes,
    atualizado_por: auth.userId,
    atualizado_em: agora.toISOString(),
  }).eq('id', body.exemplarId)

  await admin.from('biblioteca_movimentacoes').insert({
    exemplar_id: body.exemplarId,
    situacao_anterior: 'emprestado',
    situacao_nova: novaSituacaoExemplar,
    motivo: body.dano ? `Devolução com dano: ${body.observacaoDano ?? 'sem detalhe informado'}` : 'Devolução registrada no balcão',
    responsavel_id: auth.userId,
  })

  // Suspensao automatica por atraso, so se a gestao configurou dias > 0.
  // Com zero, nada alem do registro acontece, exatamente como a regra pede.
  let leitorSuspenso = false
  if (atrasado && leitor) {
    const { data: config } = await admin.from('biblioteca_configuracoes').select('dias_suspensao_por_atraso').eq('id', true).maybeSingle()
    if (config?.dias_suspensao_por_atraso && config.dias_suspensao_por_atraso > 0) {
      await admin.from('biblioteca_leitores').update({
        situacao: 'bloqueado',
        motivo_bloqueio: `Suspensão automática por devolução com ${diasAtraso} dia(s) de atraso.`,
        atualizado_por: auth.userId,
        atualizado_em: agora.toISOString(),
      }).eq('id', leitor.id)
      leitorSuspenso = true
    }
  }

  await registrarAuditoriaBiblioteca(admin, {
    usuarioId: auth.userId,
    acao: 'devolucao_registrada',
    tabelaAfetada: 'biblioteca_emprestimos',
    registroAfetado: emprestimo.id,
    valorAnterior: { situacao: emprestimo.situacao },
    valorNovo: { situacao: situacaoFinal, dias_atraso: diasAtraso },
  })

  return NextResponse.json({
    ok: true,
    atrasado,
    diasAtraso,
    obraTitulo: obra?.titulo,
    leitorNome: leitor?.nome_completo,
    novaSituacaoExemplar,
    leitorSuspenso,
  })
}
