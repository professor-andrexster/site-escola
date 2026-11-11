import { NextResponse } from 'next/server'
import { erro, exigirModerador, limparCache, texto } from '@/lib/jornal/api'
import { buscarPauta, moderarPauta, removerPauta } from '@/lib/jornal/dados'
import { auditar } from '@/lib/podcast/auditoria'

type Ctx = { params: Promise<{ id: string }> }

/** Redacao aceita (vai para a fila publica), recusa ou responde. */
export async function PATCH(request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const p = await buscarPauta(id)
  if (!p) return erro('Pauta não encontrada.', 404)
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const acao = b.acao === 'aceitar' || b.acao === 'recusar' ? b.acao : null
  const resposta = b.resposta === undefined ? undefined : texto(b.resposta, 300)
  if (!acao && resposta === undefined) return erro('Nada para mudar.')
  if (acao && p.noticiaId) return erro('Essa pauta já virou matéria. Mexa na matéria.', 409)
  await moderarPauta(id, { status: acao === 'aceitar' ? 'sugerida' : acao === 'recusar' ? 'recusada' : undefined, resposta })
  await auditar({
    atorId: r.acesso.userId, alvoTipo: 'pauta', alvoId: id, alvoNome: p.titulo, detalhe: resposta ?? null,
    acao: acao === 'aceitar' ? 'jornal.pauta_aceita' : acao === 'recusar' ? 'jornal.pauta_recusada' : 'jornal.pauta_respondida',
  })
  limparCache()
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const p = await buscarPauta(id)
  if (!p) return erro('Pauta não encontrada.', 404)
  if (p.noticiaId) return erro('Essa pauta já virou matéria e fica no histórico.', 409)
  await removerPauta(id)
  await auditar({ atorId: r.acesso.userId, acao: 'jornal.pauta_apagada', alvoTipo: 'pauta', alvoId: id, alvoNome: p.titulo })
  limparCache()
  return NextResponse.json({ ok: true })
}
