/** Validacao do corpo de curso, compartilhada entre criar e editar. */
export function lerCorpoDeCurso(body: unknown):
  | { erro: string }
  | {
      dados: {
        titulo: string
        slug: string
        descricao: string | null
        categoria: string | null
        nivel: string
        capa_url: string | null
        carga_horaria: number | null
        publicado: boolean
      }
    } {
  const b = (body ?? {}) as Record<string, unknown>
  const titulo = typeof b.titulo === 'string' ? b.titulo.trim() : ''
  const slug = typeof b.slug === 'string' ? b.slug.trim() : ''
  const descricao = typeof b.descricao === 'string' ? b.descricao.trim() : ''

  if (!titulo) return { erro: 'O título é obrigatório.' }
  if (!slug) return { erro: 'O slug é obrigatório.' }
  if (!descricao) return { erro: 'A descrição é obrigatória.' }
  if (typeof b.capa_url !== 'string' || !b.capa_url) {
    return { erro: 'A imagem de capa é obrigatória.' }
  }

  return {
    dados: {
      titulo,
      slug,
      descricao,
      categoria: typeof b.categoria === 'string' && b.categoria ? b.categoria : null,
      nivel: typeof b.nivel === 'string' && b.nivel ? b.nivel : 'Iniciante',
      capa_url: b.capa_url,
      carga_horaria: typeof b.carga_horaria === 'number' ? b.carga_horaria : null,
      publicado: b.publicado === true,
    },
  }
}
