import { NextResponse } from 'next/server'
import { erro, exigirModerador, limparCache } from '@/lib/jornal/api'
import { buscarCorrecao, removerCorrecao } from '@/lib/jornal/dados'
import { auditar } from '@/lib/podcast/auditoria'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const c = await buscarCorrecao(id)
  if (!c) return erro('Correção não encontrada.', 404)
  await removerCorrecao(id)
  await auditar({ atorId: r.acesso.userId, acao: 'jornal.correcao_removida', alvoTipo: 'noticia', alvoId: c.noticia_id, detalhe: c.texto })
  limparCache()
  return NextResponse.json({ ok: true })
}
