import { NextResponse } from 'next/server'
import { erro, exigirModerador, limparCache, texto } from '@/lib/jornal/api'
import { atualizarEdicao, buscarEdicao, materiasDaEdicao, mudarStatusEdicao, removerEdicao } from '@/lib/jornal/dados'
import { auditar } from '@/lib/podcast/auditoria'

type Ctx = { params: Promise<{ id: string }> }
const DATA = /^\d{4}-\d{2}-\d{2}$/

export async function PATCH(request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  let e = await buscarEdicao(id)
  if (!e) return erro('Edição não encontrada.', 404)
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const c = b.campos && typeof b.campos === 'object' ? (b.campos as Record<string, unknown>) : null
  const acao = b.acao === 'publicar' || b.acao === 'recolher' ? b.acao : null
  if (!c && !acao) return erro('Nada para salvar.')
  const nome = `Edição nº ${e.numero}`

  if (c) {
    const titulo = texto(c.titulo, 140)
    const inicio = texto(c.inicio, 10)
    const fim = texto(c.fim, 10)
    if (!titulo) return erro('A edição precisa de um título.')
    if (!inicio || !fim || !DATA.test(inicio) || !DATA.test(fim) || fim < inicio) return erro('Confira as datas da semana.')
    const materias = Array.isArray(c.materias) ? Array.from(new Set(c.materias.filter((x): x is string => typeof x === 'string'))).slice(0, 12) : []
    await atualizarEdicao(id, { titulo, inicio, fim, carta: texto(c.carta, 1200), materias, episodioId: texto(c.episodioId, 36) })
    await auditar({ atorId: r.acesso.userId, acao: 'jornal.edicao_editada', alvoTipo: 'edicao', alvoId: id, alvoNome: nome })
    e = (await buscarEdicao(id))!
  }

  if (acao === 'publicar') {
    // Edicao nao fecha vazia: precisa de pelo menos tres materias que estejam no ar.
    const noAr = await materiasDaEdicao(e)
    if (noAr.length < 3) {
      return NextResponse.json({ ok: false, error: `Uma edição precisa de pelo menos 3 matérias no ar. Esta tem ${noAr.length}.${c ? ' O que você mudou já está salvo.' : ''}` }, { status: 400 })
    }
    await mudarStatusEdicao(e, 'publicada')
    await auditar({ atorId: r.acesso.userId, acao: 'jornal.edicao_publicada', alvoTipo: 'edicao', alvoId: id, alvoNome: nome, detalhe: `${noAr.length} matérias` })
  } else if (acao === 'recolher') {
    await mudarStatusEdicao(e, 'rascunho')
    await auditar({ atorId: r.acesso.userId, acao: 'jornal.edicao_recolhida', alvoTipo: 'edicao', alvoId: id, alvoNome: nome })
  }
  if (acao || e.status === 'publicada') limparCache()
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const e = await buscarEdicao(id)
  if (!e) return erro('Edição não encontrada.', 404)
  if (e.status === 'publicada') return erro('Recolha a edição antes de apagar.', 409)
  await removerEdicao(id)
  await auditar({ atorId: r.acesso.userId, acao: 'jornal.edicao_apagada', alvoTipo: 'edicao', alvoId: id, alvoNome: `Edição nº ${e.numero}` })
  return NextResponse.json({ ok: true })
}
