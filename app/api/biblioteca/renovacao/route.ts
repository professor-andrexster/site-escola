import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { registrarAuditoriaBiblioteca } from '@/lib/biblioteca/auditoria'
import { calcularDataPrevista, motivoBloqueioLeitor, prazoDiasPorTipo } from '@/lib/biblioteca/emprestimos'

type CorpoRenovacao = { emprestimoId?: string }

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CorpoRenovacao
  if (!body.emprestimoId) return NextResponse.json({ error: 'Empréstimo não informado.' }, { status: 400 })

  const admin = createAdminClient()

  const { data: emprestimo } = await admin
    .from('biblioteca_emprestimos')
    .select('*, biblioteca_exemplares(obra_id), biblioteca_leitores(*)')
    .eq('id', body.emprestimoId)
    .in('situacao', ['em_andamento', 'renovado'])
    .maybeSingle()
  if (!emprestimo) return NextResponse.json({ error: 'Empréstimo não encontrado ou já foi devolvido.' }, { status: 404 })

  const leitor = Array.isArray(emprestimo.biblioteca_leitores) ? emprestimo.biblioteca_leitores[0] : emprestimo.biblioteca_leitores
  const exemplar = Array.isArray(emprestimo.biblioteca_exemplares) ? emprestimo.biblioteca_exemplares[0] : emprestimo.biblioteca_exemplares

  const motivoBloqueio = leitor ? motivoBloqueioLeitor(leitor) : null
  if (motivoBloqueio) return NextResponse.json({ error: motivoBloqueio }, { status: 400 })

  const hoje = new Date()
  const atrasado = new Date(emprestimo.data_prevista + 'T23:59:59') < hoje
  if (atrasado) {
    return NextResponse.json({ error: 'Este empréstimo está atrasado. Registre a devolução antes de renovar.' }, { status: 400 })
  }

  const { data: config } = await admin.from('biblioteca_configuracoes').select('*').eq('id', true).maybeSingle()
  if (!config) return NextResponse.json({ error: 'Configuração da biblioteca não encontrada.' }, { status: 500 })

  if (emprestimo.renovacoes_feitas >= config.max_renovacoes) {
    return NextResponse.json({ error: `Limite de ${config.max_renovacoes} renovação(ões) já atingido para este empréstimo.` }, { status: 400 })
  }

  if (exemplar?.obra_id) {
    const { count: reservasNaFila } = await admin
      .from('biblioteca_reservas')
      .select('id', { count: 'exact', head: true })
      .eq('obra_id', exemplar.obra_id)
      .eq('situacao', 'aguardando')
    if ((reservasNaFila ?? 0) > 0) {
      return NextResponse.json({ error: 'Existe reserva na fila para esta obra. Não é possível renovar, o próximo leitor está esperando.' }, { status: 400 })
    }
  }

  const { data: calendarioRows } = await admin.from('biblioteca_calendario').select('data')
  const diasSemExpediente = new Set((calendarioRows ?? []).map(c => c.data))
  const novaDataPrevista = calcularDataPrevista(hoje, prazoDiasPorTipo(config, leitor?.tipo_leitor ?? 'aluno'), diasSemExpediente)
    .toISOString().slice(0, 10)

  await admin.from('biblioteca_renovacoes').insert({
    emprestimo_id: emprestimo.id,
    autorizado_por: auth.userId,
    data_prevista_anterior: emprestimo.data_prevista,
    nova_data_prevista: novaDataPrevista,
  })

  const { data: emprestimoAtualizado, error } = await admin
    .from('biblioteca_emprestimos')
    .update({
      situacao: 'renovado',
      renovacoes_feitas: emprestimo.renovacoes_feitas + 1,
      data_prevista: novaDataPrevista,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', emprestimo.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Erro ao renovar: ' + error.message }, { status: 400 })

  await registrarAuditoriaBiblioteca(admin, {
    usuarioId: auth.userId,
    acao: 'emprestimo_renovado',
    tabelaAfetada: 'biblioteca_emprestimos',
    registroAfetado: emprestimo.id,
    valorAnterior: { data_prevista: emprestimo.data_prevista, renovacoes_feitas: emprestimo.renovacoes_feitas },
    valorNovo: { data_prevista: novaDataPrevista, renovacoes_feitas: emprestimo.renovacoes_feitas + 1 },
  })

  return NextResponse.json({ emprestimo: emprestimoAtualizado, novaDataPrevista })
}
