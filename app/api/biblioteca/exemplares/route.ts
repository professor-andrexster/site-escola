import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { registrarAuditoriaBiblioteca } from '@/lib/biblioteca/auditoria'
import { gerarProximoTombo } from '@/lib/biblioteca/tombo'

type CorpoExemplar = {
  obraId?: string
  quantidade?: number
  tombo?: string
  codigoBarras?: string | null
  estante?: string | null
  prateleira?: string | null
  origemAquisicao?: string
  valorReferencia?: number | null
  consultaLocal?: boolean
  estadoConservacao?: string
  observacoes?: string | null
}

// Localiza um exemplar por tombo ou codigo de barras, usado no balcao de
// emprestimo e devolucao (leitor de codigo de barras USB entra como
// teclado, o Enter dispara a busca).
export async function GET(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const codigo = new URL(request.url).searchParams.get('codigo')?.trim()
  if (!codigo) return NextResponse.json({ error: 'Informe o tombo ou código de barras.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: exemplar } = await admin
    .from('biblioteca_exemplares')
    .select('*, biblioteca_obras(id, titulo, capa_url)')
    .or(`tombo.eq.${codigo},codigo_barras.eq.${codigo}`)
    .maybeSingle()

  if (!exemplar) return NextResponse.json({ error: 'Nenhum exemplar encontrado com esse tombo ou código de barras.' }, { status: 404 })

  let emprestimo = null
  if (exemplar.situacao === 'emprestado') {
    const { data } = await admin
      .from('biblioteca_emprestimos')
      .select('*, biblioteca_leitores(id, nome_completo, turma, tipo_leitor)')
      .eq('exemplar_id', exemplar.id)
      .in('situacao', ['em_andamento', 'renovado'])
      .maybeSingle()
    emprestimo = data
  }

  return NextResponse.json({ exemplar, emprestimo })
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CorpoExemplar
  if (!body.obraId) return NextResponse.json({ error: 'Obra não informada.' }, { status: 400 })

  const quantidade = body.quantidade && body.quantidade > 0 ? Math.min(body.quantidade, 50) : 1
  if (body.tombo?.trim() && quantidade > 1) {
    return NextResponse.json({ error: 'Tombo digitado manualmente só serve para um exemplar por vez.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: config } = await admin.from('biblioteca_configuracoes').select('gera_tombo_automatico, prefixo_tombo').eq('id', true).maybeSingle()
  const geraAutomatico = config?.gera_tombo_automatico ?? true
  const prefixo = config?.prefixo_tombo ?? 'BIB'

  if (!body.tombo?.trim() && !geraAutomatico) {
    return NextResponse.json({ error: 'Geração automática de tombo está desligada. Informe o tombo manualmente.' }, { status: 400 })
  }

  const criados = []
  for (let i = 0; i < quantidade; i++) {
    const tombo = body.tombo?.trim() || (await gerarProximoTombo(admin, prefixo))
    const { data: exemplar, error } = await admin
      .from('biblioteca_exemplares')
      .insert({
        obra_id: body.obraId,
        tombo,
        codigo_barras: body.codigoBarras?.trim() || null,
        estante: body.estante?.trim() || null,
        prateleira: body.prateleira?.trim() || null,
        origem_aquisicao: body.origemAquisicao || 'compra',
        valor_referencia: body.valorReferencia ?? null,
        consulta_local: body.consultaLocal ?? false,
        estado_conservacao: body.estadoConservacao || 'bom',
        observacoes: body.observacoes?.trim() || null,
        atualizado_por: auth.userId,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `Já existe um exemplar com o tombo ${tombo}. ${criados.length} exemplar(es) já foram criados antes deste erro.`, criados },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: 'Erro ao criar exemplar: ' + error.message, criados }, { status: 400 })
    }

    criados.push(exemplar)
    await registrarAuditoriaBiblioteca(admin, {
      usuarioId: auth.userId,
      acao: 'exemplar_criado',
      tabelaAfetada: 'biblioteca_exemplares',
      registroAfetado: exemplar.id,
      valorNovo: exemplar,
    })
  }

  return NextResponse.json({ exemplares: criados })
}
