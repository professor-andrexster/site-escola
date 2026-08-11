import { prisma } from '@/lib/db'

/**
 * Auditoria do modulo de biblioteca.
 *
 * valor_anterior e valor_novo sao colunas JSON — no MariaDB, longtext com uma
 * CHECK. O Prisma tipa como String, entao a serializacao acontece aqui e nao
 * em cada chamador.
 *
 * Falha na auditoria nunca derruba o fluxo principal, mas aparece no log do
 * servidor: auditoria que para de gravar em silencio e pior que nao ter.
 */
export async function registrarAuditoriaBiblioteca(entrada: {
  usuarioId: string | null
  acao: string
  tabelaAfetada: string
  registroAfetado?: string | null
  valorAnterior?: unknown
  valorNovo?: unknown
}) {
  try {
    await prisma.biblioteca_auditoria.create({
      data: {
        usuario_id: entrada.usuarioId,
        acao: entrada.acao,
        tabela_afetada: entrada.tabelaAfetada,
        registro_afetado: entrada.registroAfetado ?? null,
        valor_anterior:
          entrada.valorAnterior === undefined ? null : JSON.stringify(entrada.valorAnterior),
        valor_novo: entrada.valorNovo === undefined ? null : JSON.stringify(entrada.valorNovo),
      },
    })
  } catch (erro) {
    console.error('[biblioteca_auditoria] falha ao registrar', erro)
  }
}
