import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Garante que o chamador da rota é direção aprovada.
 * Retorna o id do usuário ou uma NextResponse de erro pronta.
 */
export async function exigirDirecao(): Promise<{ ok: true; userId: string } | { ok: false; res: NextResponse }> {
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

  if (!profile?.aprovado || profile.role !== 'direcao') {
    return { ok: false, res: NextResponse.json({ error: 'Sem permissão.' }, { status: 403 }) }
  }

  return { ok: true, userId: user.id }
}
