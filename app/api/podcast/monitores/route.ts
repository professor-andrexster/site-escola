import { NextResponse } from 'next/server'
import { adicionarMonitor, nomeDoUsuario, professoresDisponiveis } from '@/lib/podcast/dados'
import { auditar } from '@/lib/podcast/auditoria'
import { erro, exigirAcesso } from '@/lib/podcast/api'

/** Direção designa um professor como monitor do podcast. */
export async function POST(request: Request) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  if (!r.acesso.gestao) return erro('Só a direção escolhe os monitores do podcast.', 403)
  const b = (await request.json().catch(() => ({}))) as { userId?: unknown }
  if (typeof b.userId !== 'string') return erro('Escolha um professor.')
  const disponiveis = await professoresDisponiveis()
  if (!disponiveis.some(p => p.id === b.userId)) return erro('Esse professor não está disponível (já é da equipe ou não foi aprovado).')
  try {
    const m = await adicionarMonitor(b.userId, r.acesso.userId)
    await auditar({ atorId: r.acesso.userId, acao: 'monitor.adicionado', alvoTipo: 'monitor', alvoId: m.id, alvoNome: await nomeDoUsuario(b.userId) })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[podcast/monitores]', e)
    return erro('Não consegui adicionar o monitor. Tente de novo.', 500)
  }
}
