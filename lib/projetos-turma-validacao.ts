import type { Criterio, Etapa, Marca, Marcas } from '@/lib/projetos-turma-tipos'

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

/** Data YYYY-MM-DD valida ou null. Qualquer outra coisa vira null (nao 400: e campo opcional). */
export function data(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null
  const d = new Date(t + 'T00:00:00Z')
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== t ? null : t
}

/**
 * Cronograma vindo do formulario: lista de etapas com titulo. Linha sem
 * titulo e descartada (o professor deixou uma sobrando). Maximo 30 etapas.
 */
export function cronograma(v: unknown): Etapa[] {
  if (!Array.isArray(v)) return []
  return v.slice(0, 30).flatMap((e): Etapa[] => {
    if (!e || typeof e !== 'object') return []
    const o = e as Record<string, unknown>
    const titulo = texto(o.titulo, 120)
    if (!titulo) return []
    return [{
      titulo,
      foco: texto(o.foco, 300) ?? '',
      entrega: texto(o.entrega, 300) ?? '',
      inicio: data(o.inicio),
      fim: data(o.fim),
      aviso: texto(o.aviso, 200),
    }]
  })
}

/** Criterios do formulario: titulo obrigatorio, peso inteiro 1-10 (padrao 1). Maximo 20. */
export function criterios(v: unknown): Criterio[] {
  if (!Array.isArray(v)) return []
  return v.slice(0, 20).flatMap((c): Criterio[] => {
    if (!c || typeof c !== 'object') return []
    const o = c as Record<string, unknown>
    const titulo = texto(o.titulo, 140)
    if (!titulo) return []
    const p = Math.round(Number(o.peso))
    return [{ titulo, descricao: texto(o.descricao, 400) ?? '', peso: Number.isFinite(p) && p >= 1 ? Math.min(p, 10) : 1 }]
  })
}

/** Marcas da avaliacao: so indices existentes e valores 0, 1 ou 2. Null quando nao veio nada. */
export function marcas(v: unknown, totalCriterios: number): Marcas | null {
  if (!v || typeof v !== 'object') return null
  const saida: Marcas = {}
  for (const [k, valor] of Object.entries(v as Record<string, unknown>)) {
    const i = Number(k)
    const m = Number(valor)
    if (!Number.isInteger(i) || i < 0 || i >= totalCriterios) continue
    if (m !== 0 && m !== 1 && m !== 2) continue
    saida[String(i)] = m as Marca
  }
  return Object.keys(saida).length ? saida : null
}

/** Indice de etapa valido para o cronograma dado, ou null. */
export function etapa(v: unknown, totalEtapas: number): number | null {
  if (v == null || v === '') return null
  const i = Number(v)
  return Number.isInteger(i) && i >= 0 && i < totalEtapas ? i : null
}
