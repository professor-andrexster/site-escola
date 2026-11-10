import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { acessoDe, type Acesso } from '@/lib/podcast/dados'
import type { Episodio } from '@/lib/podcast/tipos'

/** Guardas das rotas /api/podcast. Toda resposta de erro vem com `ok:false` e mensagem. */

export const erro = (mensagem: string, status = 400) => NextResponse.json({ ok: false, error: mensagem }, { status })

export async function exigirAcesso(): Promise<{ ok: true; acesso: Acesso } | { ok: false; res: NextResponse }> {
  const u = await usuarioAtual()
  if (!u) return { ok: false, res: erro('Entre no site para continuar.', 401) }
  const acesso = await acessoDe(u.id)
  if (!acesso) return { ok: false, res: erro('Sua conta ainda não foi aprovada.', 403) }
  return { ok: true, acesso }
}

export async function exigirModerador() {
  const r = await exigirAcesso()
  if (!r.ok) return r
  if (!r.acesso.moderador) return { ok: false as const, res: erro('Só o monitor do podcast ou a direção faz isso.', 403) }
  return r
}

/** Aluno da equipe com autorizacao valida. */
export const alunoLiberado = (a: Acesso) => Boolean(a.membro && a.membro.papel === 'aluno' && a.membro.liberado)

export const participa = (ep: Episodio, userId: string) =>
  ep.autorId === userId || ep.participantes.some(p => p.userId === userId)

/** Quem pode mexer no conteudo do episodio agora. */
export function podeEditar(ep: Episodio, a: Acesso): boolean {
  if (a.moderador) return true
  return alunoLiberado(a) && participa(ep, a.userId) && (ep.status === 'rascunho' || ep.status === 'ajustar')
}

export const texto = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null
