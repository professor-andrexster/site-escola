import type { CamposDeProjeto } from '@/lib/db/comunidade'

export function lerCorpoDeProjeto(body: unknown): { erro: string } | { dados: CamposDeProjeto } {
  const b = (body ?? {}) as Record<string, unknown>
  const titulo = typeof b.titulo === 'string' ? b.titulo.trim() : ''
  if (!titulo) return { erro: 'Informe o título do projeto.' }

  const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  return {
    dados: {
      titulo,
      trilha_id: typeof b.trilha_id === 'string' && b.trilha_id ? b.trilha_id : null,
      descricao: texto(b.descricao),
      link_externo: texto(b.link_externo),
      tags: Array.isArray(b.tags) ? b.tags.filter((t): t is string => typeof t === 'string') : [],
      destaque: b.destaque === true,
      imagem_url: texto(b.imagem_url),
      serie_na_epoca: texto(b.serie_na_epoca),
    },
  }
}
