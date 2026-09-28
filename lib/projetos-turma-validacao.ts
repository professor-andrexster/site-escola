/** Saneamento dos corpos das rotas de /api/projetos-turma. */

export const texto = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null

/**
 * Link http(s) ate 300 caracteres, ou null quando veio vazio. Devolve `false`
 * quando veio algo que nao e link — a rota transforma isso em 400 com
 * mensagem, em vez de gravar "meusite.vercel.app" sem protocolo e deixar o
 * professor clicar num link que nao abre.
 */
export function link(v: unknown): string | null | false {
  const t = texto(v, 300)
  if (t === null) return null
  return /^https?:\/\/\S+$/i.test(t) ? t : false
}

/** Nota 0-10 com uma casa, null quando vazia, `false` quando invalida. */
export function nota(v: unknown): number | null | false {
  if (v == null || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || n > 10) return false
  return Math.round(n * 10) / 10
}
