import { NextResponse } from 'next/server'
import { buscarExemplarPorCodigo, emprestimoAbertoComLeitor, criarExemplar,
         configuracao } from '@/lib/db/biblioteca'
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

  const exemplar = await buscarExemplarPorCodigo(codigo)

  if (!exemplar) return NextResponse.json({ error: 'Nenhum exemplar encontrado com esse tombo ou código de barras.' }, { status: 404 })

  const emprestimo =
    exemplar.situacao === 'emprestado' ? await emprestimoAbertoComLeitor(exemplar.id) : null

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

  const config = await configuracao()
  const geraAutomatico = config?.gera_tombo_automatico ?? true
  const prefixo = config?.prefixo_tombo ?? 'BIB'

  if (!body.tombo?.trim() && !geraAutomatico) {
    return NextResponse.json({ error: 'Geração automática de tombo está desligada. Informe o tombo manualmente.' }, { status: 400 })
  }

  const criados = []
  for (let i = 0; i < quantidade; i++) {
    const tombo = body.tombo?.trim() || (await gerarProximoTombo(prefixo))
    let exemplar
    try {
      exemplar = await criarExemplar({
        obraId: body.obraId!,
        tombo,
        codigoBarras: body.codigoBarras?.trim() || null,
        estante: body.estante?.trim() || null,
        prateleira: body.prateleira?.trim() || null,
        origemAquisicao: body.origemAquisicao || 'compra',
        valorReferencia: body.valorReferencia ?? null,
        consultaLocal: body.consultaLocal ?? false,
        estadoConservacao: body.estadoConservacao || 'bom',
        observacoes: body.observacoes?.trim() || null,
        atualizadoPor: auth.userId,
      })
    } catch (erro) {
      const error = erro as { code?: string }
      // P2002 no Prisma e o antigo 23505 do Postgres: tombo repetido.
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: `Já existe um exemplar com o tombo ${tombo}. ${criados.length} exemplar(es) já foram criados antes deste erro.`, criados },
          { status: 400 }
        )
      }
      console.error('[biblioteca/exemplares] falha ao criar', erro)
      return NextResponse.json({ error: 'Erro ao criar o exemplar.', criados }, { status: 400 })
    }

    criados.push(exemplar)
    await registrarAuditoriaBiblioteca({
      usuarioId: auth.userId,
      acao: 'exemplar_criado',
      tabelaAfetada: 'biblioteca_exemplares',
      registroAfetado: exemplar.id,
      valorNovo: exemplar,
    })
  }

  return NextResponse.json({ exemplares: criados })
}
