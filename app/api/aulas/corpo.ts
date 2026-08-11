/** Validacao do corpo de aula, compartilhada entre criar e editar. */
export function lerCorpoDeAula(body: unknown):
  | { erro: string }
  | {
      dados: {
        titulo: string
        slug: string
        descricao: string | null
        duracao_estimada_min: number | null
        publicado: boolean
        slides_urls: string[]
      }
    } {
  const b = (body ?? {}) as Record<string, unknown>
  const titulo = typeof b.titulo === 'string' ? b.titulo.trim() : ''
  const slug = typeof b.slug === 'string' ? b.slug.trim() : ''

  if (!titulo) return { erro: 'O título é obrigatório.' }
  if (!slug) return { erro: 'O slug é obrigatório.' }

  return {
    dados: {
      titulo,
      slug,
      descricao: typeof b.descricao === 'string' && b.descricao ? b.descricao : null,
      duracao_estimada_min: typeof b.duracao_estimada_min === 'number' ? b.duracao_estimada_min : null,
      publicado: b.publicado === true,
      slides_urls: Array.isArray(b.slides_urls)
        ? b.slides_urls.filter((u): u is string => typeof u === 'string')
        : [],
    },
  }
}
