import type { SupabaseClient } from '@supabase/supabase-js'

export async function registrarAuditoriaBiblioteca(
  admin: SupabaseClient,
  entrada: {
    usuarioId: string | null
    acao: string
    tabelaAfetada: string
    registroAfetado?: string | null
    valorAnterior?: Record<string, unknown> | null
    valorNovo?: Record<string, unknown> | null
  }
) {
  const { error } = await admin.from('biblioteca_auditoria').insert({
    usuario_id: entrada.usuarioId,
    acao: entrada.acao,
    tabela_afetada: entrada.tabelaAfetada,
    registro_afetado: entrada.registroAfetado ?? null,
    valor_anterior: entrada.valorAnterior ?? null,
    valor_novo: entrada.valorNovo ?? null,
  })
  // Falha na auditoria nunca deve derrubar o fluxo principal
  if (error) console.error('[biblioteca_auditoria]', error.message)
}
