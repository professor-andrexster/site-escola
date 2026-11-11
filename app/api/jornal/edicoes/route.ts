import { NextResponse } from 'next/server'
import { erro, exigirModerador } from '@/lib/jornal/api'
import { criarEdicao } from '@/lib/jornal/dados'
import { auditar } from '@/lib/podcast/auditoria'

/** Abre a edicao da semana em rascunho, ja com o que saiu de segunda para ca. */
export async function POST() {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  try {
    const e = await criarEdicao(r.acesso.userId)
    await auditar({ atorId: r.acesso.userId, acao: 'jornal.edicao_criada', alvoTipo: 'edicao', alvoId: e.id, alvoNome: `Edição nº ${e.numero}` })
    return NextResponse.json({ ok: true, id: e.id })
  } catch (e) {
    console.error('[jornal/edicoes] criar', e)
    return erro('Não deu para abrir a edição. Tente de novo.', 500)
  }
}
