import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isGestao } from '@/lib/roles'

/**
 * Garante que o chamador da rota e gestao aprovada (diretora, vice diretora
 * ou admin). Retorna o id do usuario ou uma NextResponse de erro pronta.
 */
export async function exigirGestao(): Promise<{ ok: true; userId: string } | { ok: false; res: NextResponse }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, res: NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, aprovado')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.aprovado || !isGestao(profile.role)) {
    return { ok: false, res: NextResponse.json({ error: 'Sem permissão.' }, { status: 403 }) }
  }

  return { ok: true, userId: user.id }
}

/**
 * Garante que o chamador e professor aprovado ou gestao. Usado nas rotas
 * onde professor tambem pode agir, como a aprovacao de cadastro de aluno.
 */
export async function exigirProfessorOuGestao(): Promise<
  { ok: true; userId: string; role: string } | { ok: false; res: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, res: NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, aprovado')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.aprovado || (profile.role !== 'professor' && !isGestao(profile.role))) {
    return { ok: false, res: NextResponse.json({ error: 'Sem permissão.' }, { status: 403 }) }
  }

  return { ok: true, userId: user.id, role: profile.role }
}

/**
 * Garante que o chamador e bibliotecario ou gestao. Usado nas rotas de
 * escrita do modulo de biblioteca (acervo, exemplares, leitores).
 */
export async function exigirBibliotecaStaff(): Promise<
  { ok: true; userId: string; role: string } | { ok: false; res: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, res: NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, aprovado')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.aprovado || (profile.role !== 'bibliotecario' && !isGestao(profile.role))) {
    return { ok: false, res: NextResponse.json({ error: 'Sem permissão.' }, { status: 403 }) }
  }

  return { ok: true, userId: user.id, role: profile.role }
}
