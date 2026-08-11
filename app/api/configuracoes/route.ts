import { NextResponse } from 'next/server'
import { exigirGestao } from '@/lib/apiGestao'
import { configuracoesDoSite, salvarConfiguracoes } from '@/lib/db/comunidade'

/** As chaves que a tela edita. Nada fora desta lista entra na tabela. */
const CHAVES = ['nome_escola', 'descricao_escola', 'cor_primaria', 'cor_secundaria']

export async function GET() {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res
  return NextResponse.json({ valores: await configuracoesDoSite() })
}

export async function PUT(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { valores } = (await request.json()) as { valores?: Record<string, unknown> }
  if (!valores || typeof valores !== 'object') {
    return NextResponse.json({ error: 'Nada para salvar.' }, { status: 400 })
  }

  const limpos = CHAVES.map(chave => ({
    chave,
    valor: typeof valores[chave] === 'string' ? (valores[chave] as string) : '',
  }))

  try {
    await salvarConfiguracoes(limpos)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[configuracoes] falha ao salvar', erro)
    return NextResponse.json({ error: 'Erro ao salvar as configurações.' }, { status: 400 })
  }
}
