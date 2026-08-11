import type { CamposDeNoticia } from '@/lib/db/noticias'

export function lerCorpoDeNoticia(body: unknown): { erro: string } | { dados: CamposDeNoticia } {
  const b = (body ?? {}) as Record<string, unknown>
  const titulo = typeof b.titulo === 'string' ? b.titulo.trim() : ''
  const slug = typeof b.slug === 'string' ? b.slug.trim() : ''
  if (!titulo) return { erro: 'O título é obrigatório.' }
  if (!slug) return { erro: 'O slug é obrigatório.' }

  const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null)
  return {
    dados: {
      titulo,
      slug,
      resumo: texto(b.resumo),
      conteudo: texto(b.conteudo),
      imagem_url: texto(b.imagem_url),
      publicado: b.publicado === true,
      destaque_home: b.destaque_home === true,
      categoria: texto(b.categoria),
    },
  }
}
