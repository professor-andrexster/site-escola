import type { SupabaseClient } from '@supabase/supabase-js'

export type AcaoLog =
  | 'cadastro_aluno'
  | 'cadastro_professor'
  | 'cadastro_recusado'
  | 'login_ok'
  | 'login_falha'
  | 'senha_redefinida_cpf'
  | 'senha_redefinida_admin'
  | 'recuperacao_recusada'
  | 'usuario_criado_direcao'

/** Extrai o IP do request (Vercel preenche x-forwarded-for). */
export function ipDoRequest(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? null
}

/** Registra uma atividade no log de auditoria. Usar sempre o admin client (service role). */
export async function registrarAtividade(
  admin: SupabaseClient,
  entrada: { acao: AcaoLog; userId?: string | null; detalhes?: Record<string, unknown>; ip?: string | null }
) {
  const { error } = await admin.from('log_atividades').insert({
    acao: entrada.acao,
    user_id: entrada.userId ?? null,
    detalhes: entrada.detalhes ?? null,
    ip: entrada.ip ?? null,
  })
  // Falha no log nunca deve derrubar o fluxo principal
  if (error) console.error('[log_atividades]', error.message)
}

/**
 * Conta registros recentes de uma ação cujo campo `detalhes->chave` = valor
 * (ou por IP), para rate limit baseado no próprio log.
 */
export async function contarRecentes(
  admin: SupabaseClient,
  opts: { acao: AcaoLog; janelaMin: number; chave?: string; valor?: string; ip?: string | null }
): Promise<number> {
  const desde = new Date(Date.now() - opts.janelaMin * 60_000).toISOString()
  let query = admin
    .from('log_atividades')
    .select('id', { count: 'exact', head: true })
    .eq('acao', opts.acao)
    .gte('criado_em', desde)

  if (opts.chave && opts.valor) query = query.eq(`detalhes->>${opts.chave}`, opts.valor)
  if (opts.ip) query = query.eq('ip', opts.ip)

  const { count } = await query
  return count ?? 0
}
