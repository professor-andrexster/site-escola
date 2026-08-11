import { NextResponse } from 'next/server'
import { exigirGestao } from '@/lib/apiGestao'
import { salvarPagina } from '@/lib/db/comunidade'

/** Paginas institucionais editaveis. So a gestao escreve. */
const PAGINAS_PERMITIDAS = ['sobre', 'emti', 'projeto-vida', 'eletivas', 'protagonismo']

export async function PUT(request: Request, { params }: { params: Promise<{ pagina: string }> }) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { pagina } = await params
  if (!PAGINAS_PERMITIDAS.includes(pagina)) {
    return NextResponse.json({ error: 'Página desconhecida.' }, { status: 404 })
  }

  const { titulo, conteudo } = (await request.json()) as { titulo?: string; conteudo?: string }
  if (typeof titulo !== 'string' || !titulo.trim()) {
    return NextResponse.json({ error: 'O título é obrigatório.' }, { status: 400 })
  }

  try {
    await salvarPagina(pagina, titulo.trim(), typeof conteudo === 'string' ? conteudo : '')
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[paginas/:pagina] falha ao salvar', erro)
    return NextResponse.json({ error: 'Erro ao salvar a página.' }, { status: 400 })
  }
}
