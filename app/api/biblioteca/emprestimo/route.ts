import { NextResponse } from 'next/server'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { GESTAO_ROLES } from '@/lib/roles'
import {
  buscarLeitor,
  configuracao,
  diasSemExpediente as buscarDiasSemExpediente,
  emprestar,
  emprestimosAtivosDoLeitor,
  ErroCirculacao,
} from '@/lib/db/biblioteca'
import {
  calcularDataPrevista,
  limiteExemplaresPorTipo,
  motivoBloqueioLeitor,
  prazoDiasPorTipo,
} from '@/lib/biblioteca/emprestimos'

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
  if (!body.leitorId) {
    return NextResponse.json({ error: 'Selecione o leitor.' }, { status: 400 })
  }
  if (exemplarIds.length === 0) {
    return NextResponse.json({ error: 'Leia ou digite ao menos um exemplar.' }, { status: 400 })
  }
  if (body.dataPrevistaAjustada && !(GESTAO_ROLES as string[]).includes(auth.role)) {
    return NextResponse.json(
      { error: 'Só a gestão pode ajustar a data prevista de devolução.' },
      { status: 403 }
    )
  }

  const leitor = await buscarLeitor(body.leitorId)
  if (!leitor) return NextResponse.json({ error: 'Leitor não encontrado.' }, { status: 404 })

  const motivoBloqueio = motivoBloqueioLeitor(leitor)
  if (motivoBloqueio) return NextResponse.json({ error: motivoBloqueio }, { status: 400 })

  const config = await configuracao()
  if (!config) {
    return NextResponse.json({ error: 'Configuração da biblioteca não encontrada.' }, { status: 500 })
  }

  const abertos = await emprestimosAtivosDoLeitor(leitor.id)
  const limite = limiteExemplaresPorTipo(config, leitor.tipo_leitor)
  if (abertos + exemplarIds.length > limite) {
    return NextResponse.json(
      {
        error: `${leitor.nome_completo} já está com ${abertos} exemplar(es). O limite para ${leitor.tipo_leitor} é ${limite}. Não é possível emprestar mais ${exemplarIds.length}.`,
      },
      { status: 400 }
    )
  }

  const feriados = new Set(
    (await buscarDiasSemExpediente()).map(d => d.toISOString().slice(0, 10))
  )
  const agora = new Date()
  const dataPrevista = body.dataPrevistaAjustada
    ? body.dataPrevistaAjustada
    : calcularDataPrevista(agora, prazoDiasPorTipo(config, leitor.tipo_leitor), feriados)
        .toISOString()
        .slice(0, 10)

  // Cada exemplar e uma transacao propria, de proposito: emprestar tres livros
  // e uma pilha de tres operacoes independentes. Se o segundo estiver
  // indisponivel, o primeiro continua valendo e o balcao ve o erro do segundo.
  const criados = []
  const erros: string[] = []

  for (const exemplarId of exemplarIds) {
    try {
      const { emprestimo, titulo, tombo } = await emprestar({
        exemplarId,
        leitorId: leitor.id,
        dataPrevista: new Date(dataPrevista),
        registradoPor: auth.userId,
      })
      criados.push({ ...emprestimo, obraTitulo: titulo, tombo })
    } catch (erro) {
      if (erro instanceof ErroCirculacao) {
        erros.push(erro.message)
        continue
      }
      // Violacao do indice unico que impede dois emprestimos abertos do mesmo
      // exemplar: no MariaDB o codigo e P2002 (Prisma), nao 23505 (Postgres).
      const codigo = (erro as { code?: string })?.code
      erros.push(
        codigo === 'P2002'
          ? `Exemplar ${exemplarId}: já está emprestado para outro leitor.`
          : `Exemplar ${exemplarId}: erro ao registrar o empréstimo.`
      )
      console.error('[biblioteca/emprestimo] falha', erro)
    }
  }

  if (criados.length === 0) {
    return NextResponse.json(
      { error: erros.join(' ') || 'Nenhum exemplar pôde ser emprestado.' },
      { status: 400 }
    )
  }

  return NextResponse.json({ emprestimos: criados, erros, dataPrevista })
}
