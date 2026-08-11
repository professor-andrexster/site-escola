import { NextResponse } from 'next/server'
import { exigirGestao } from '@/lib/apiGestao'
import { atualizarProjeto, removerProjeto } from '@/lib/db/comunidade'
import { lerCorpoDeProjeto } from '../corpo'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res
  const { id } = await params

  const corpo = lerCorpoDeProjeto(await request.json())
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })

  try {
    const projeto = await atualizarProjeto(id, corpo.dados)
    return NextResponse.json({ projeto })
  } catch (erro) {
    console.error('[projetos/:id] falha ao atualizar', erro)
    return NextResponse.json({ error: 'Erro ao salvar o projeto.' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res
  const { id } = await params

  try {
    await removerProjeto(id)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[projetos/:id] falha ao remover', erro)
    return NextResponse.json({ error: 'Erro ao remover o projeto.' }, { status: 400 })
  }
}
