import { NextResponse } from 'next/server'
import { buscarExemplar, atualizarExemplar } from '@/lib/db/biblioteca'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { registrarAuditoriaBiblioteca } from '@/lib/biblioteca/auditoria'

type CorpoExemplar = {
  codigoBarras?: string | null
  estante?: string | null
  prateleira?: string | null
  origemAquisicao?: string
  valorReferencia?: number | null
  consultaLocal?: boolean
  estadoConservacao?: string
  observacoes?: string | null
  situacao?: string
  motivo?: string
}

// Situacoes que este endpoint pode gravar diretamente. "emprestado" e
// "reservado" ficam de fora de proposito: so o fluxo de circulacao (fase
// seguinte do modulo) pode gravar essas duas, porque envolvem leitor e
// data prevista.
const SITUACOES_PERMITIDAS = ['disponivel', 'em_reparo', 'extraviado', 'baixado']

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { id } = await params
  const body = (await request.json()) as CorpoExemplar

  const anterior = await buscarExemplar(id)
  if (!anterior) return NextResponse.json({ error: 'Exemplar não encontrado.' }, { status: 404 })

  if (body.situacao && body.situacao !== anterior.situacao) {
    if (!SITUACOES_PERMITIDAS.includes(body.situacao)) {
      return NextResponse.json({ error: 'Essa situação só pode ser definida pelo empréstimo ou pela reserva.' }, { status: 400 })
    }
    if (['emprestado', 'reservado'].includes(anterior.situacao)) {
      return NextResponse.json({ error: 'Este exemplar está emprestado ou reservado. Registre a devolução antes de mudar a situação.' }, { status: 400 })
    }
    if (!body.motivo?.trim()) {
      return NextResponse.json({ error: 'Informe o motivo da mudança de situação.' }, { status: 400 })
    }
  }

  const dados: Record<string, unknown> = {
    codigo_barras: body.codigoBarras?.trim() || null,
    estante: body.estante?.trim() || null,
    prateleira: body.prateleira?.trim() || null,
    origem_aquisicao: body.origemAquisicao || anterior.origem_aquisicao,
    valor_referencia: body.valorReferencia ?? null,
    consulta_local: body.consultaLocal ?? anterior.consulta_local,
    estado_conservacao: body.estadoConservacao || anterior.estado_conservacao,
    observacoes: body.observacoes?.trim() || null,
    atualizado_por: auth.userId,

  }
  if (body.situacao) dados.situacao = body.situacao

  // Mudanca de situacao e movimentacao vao na mesma transacao: exemplar que
  // troca de estado sem entrada no historico quebra o inventario do acervo.
  const mudouSituacao = !!body.situacao && body.situacao !== anterior.situacao

  let exemplar
  try {
    exemplar = await atualizarExemplar(
      id,
      dados,
      mudouSituacao
        ? {
            situacaoAnterior: anterior.situacao,
            situacaoNova: body.situacao!,
            motivo: body.motivo!,
            responsavelId: auth.userId,
          }
        : undefined
    )
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe outro exemplar com esse código de barras.' },
        { status: 400 }
      )
    }
    console.error('[biblioteca/exemplares] falha ao salvar', erro)
    return NextResponse.json({ error: 'Erro ao salvar o exemplar.' }, { status: 400 })
  }

  await registrarAuditoriaBiblioteca({
    usuarioId: auth.userId,
    acao: 'exemplar_editado',
    tabelaAfetada: 'biblioteca_exemplares',
    registroAfetado: id,
    valorAnterior: anterior,
    valorNovo: exemplar,
  })

  return NextResponse.json({ exemplar })
}
