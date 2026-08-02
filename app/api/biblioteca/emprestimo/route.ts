import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { GESTAO_ROLES } from '@/lib/roles'
import { registrarAuditoriaBiblioteca } from '@/lib/biblioteca/auditoria'
import { calcularDataPrevista, limiteExemplaresPorTipo, motivoBloqueioLeitor, prazoDiasPorTipo } from '@/lib/biblioteca/emprestimos'

type CorpoEmprestimo = {
  leitorId?: string
  exemplarIds?: string[]
  dataPrevistaAjustada?: string
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CorpoEmprestimo
  const exemplarIds = Array.from(new Set(body.exemplarIds ?? []))
  if (!body.leitorId) return NextResponse.json({ error: 'Selecione o leitor.' }, { status: 400 })
  if (exemplarIds.length === 0) return NextResponse.json({ error: 'Leia ou digite ao menos um exemplar.' }, { status: 400 })
  if (body.dataPrevistaAjustada && !(GESTAO_ROLES as string[]).includes(auth.role)) {
    return NextResponse.json({ error: 'Só a gestão pode ajustar a data prevista de devolução.' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { data: leitor } = await admin.from('biblioteca_leitores').select('*').eq('id', body.leitorId).maybeSingle()
  if (!leitor) return NextResponse.json({ error: 'Leitor não encontrado.' }, { status: 404 })

  const motivoBloqueio = motivoBloqueioLeitor(leitor)
  if (motivoBloqueio) return NextResponse.json({ error: motivoBloqueio }, { status: 400 })

  const { data: config } = await admin.from('biblioteca_configuracoes').select('*').eq('id', true).maybeSingle()
  if (!config) return NextResponse.json({ error: 'Configuração da biblioteca não encontrada.' }, { status: 500 })

  const { count: emprestimosAbertos } = await admin
    .from('biblioteca_emprestimos')
    .select('id', { count: 'exact', head: true })
    .eq('leitor_id', leitor.id)
    .in('situacao', ['em_andamento', 'renovado'])

  const limite = limiteExemplaresPorTipo(config, leitor.tipo_leitor)
  const totalAposEmprestimo = (emprestimosAbertos ?? 0) + exemplarIds.length
  if (totalAposEmprestimo > limite) {
    return NextResponse.json({
      error: `${leitor.nome_completo} já está com ${emprestimosAbertos ?? 0} exemplar(es). O limite para ${leitor.tipo_leitor} é ${limite}. Não é possível emprestar mais ${exemplarIds.length}.`,
    }, { status: 400 })
  }

  const { data: calendarioRows } = await admin.from('biblioteca_calendario').select('data')
  const diasSemExpediente = new Set((calendarioRows ?? []).map(c => c.data))

  const agora = new Date()
  const dataPrevista = body.dataPrevistaAjustada
    ? body.dataPrevistaAjustada
    : calcularDataPrevista(agora, prazoDiasPorTipo(config, leitor.tipo_leitor), diasSemExpediente).toISOString().slice(0, 10)

  const criados = []
  const erros: string[] = []

  for (const exemplarId of exemplarIds) {
    const { data: exemplar } = await admin.from('biblioteca_exemplares').select('*, biblioteca_obras(titulo)').eq('id', exemplarId).maybeSingle()
    if (!exemplar) { erros.push(`Exemplar não encontrado (${exemplarId}).`); continue }
    const obraTitulo = Array.isArray(exemplar.biblioteca_obras) ? exemplar.biblioteca_obras[0]?.titulo : exemplar.biblioteca_obras?.titulo
    if (exemplar.consulta_local) { erros.push(`${obraTitulo}, tombo ${exemplar.tombo}: é só para consulta local, não sai por empréstimo.`); continue }
    if (exemplar.situacao !== 'disponivel') { erros.push(`${obraTitulo}, tombo ${exemplar.tombo}: não está disponível (${exemplar.situacao}).`); continue }

    const { data: emprestimo, error: errEmprestimo } = await admin
      .from('biblioteca_emprestimos')
      .insert({
        exemplar_id: exemplarId,
        leitor_id: leitor.id,
        data_prevista: dataPrevista,
        registrado_por: auth.userId,
      })
      .select('*')
      .single()

    if (errEmprestimo) {
      // 23505: violacao do indice unico que impede dois emprestimos abertos do mesmo exemplar
      erros.push(errEmprestimo.code === '23505'
        ? `${obraTitulo}, tombo ${exemplar.tombo}: já está emprestado para outro leitor.`
        : `${obraTitulo}, tombo ${exemplar.tombo}: erro ao registrar (${errEmprestimo.message}).`)
      continue
    }

    await admin.from('biblioteca_exemplares').update({ situacao: 'emprestado', atualizado_por: auth.userId, atualizado_em: new Date().toISOString() }).eq('id', exemplarId)
    await admin.from('biblioteca_movimentacoes').insert({
      exemplar_id: exemplarId,
      situacao_anterior: 'disponivel',
      situacao_nova: 'emprestado',
      motivo: 'Empréstimo registrado no balcão',
      responsavel_id: auth.userId,
    })
    await registrarAuditoriaBiblioteca(admin, {
      usuarioId: auth.userId,
      acao: 'emprestimo_registrado',
      tabelaAfetada: 'biblioteca_emprestimos',
      registroAfetado: emprestimo.id,
      valorNovo: emprestimo,
    })

    criados.push({ ...emprestimo, obraTitulo, tombo: exemplar.tombo })
  }

  if (criados.length === 0) {
    return NextResponse.json({ error: erros.join(' ') || 'Nenhum exemplar pôde ser emprestado.' }, { status: 400 })
  }

  return NextResponse.json({ emprestimos: criados, erros, dataPrevista })
}
