export interface DadosIsbn {
  titulo: string
  subtitulo?: string
  autores: string[]
  editora?: string
  anoPublicacao?: number
  numeroPaginas?: number
}

interface OpenLibraryAutorRef {
  key: string
}

interface OpenLibraryLivro {
  title?: string
  subtitle?: string
  authors?: OpenLibraryAutorRef[]
  publishers?: string[]
  publish_date?: string
  number_of_pages?: number
}

/** Busca dados bibliograficos na Open Library, publica e sem chave. Usada so
 * para pre preencher o formulario de cadastro de obra, sempre editavel
 * antes de salvar. Retorna null se nao encontrar ou a rede falhar. */
export async function buscarPorIsbn(isbn: string): Promise<DadosIsbn | null> {
  const isbnLimpo = isbn.replace(/[^0-9Xx]/g, '')
  if (!isbnLimpo) return null

  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbnLimpo}.json`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const livro = (await res.json()) as OpenLibraryLivro

    let autores: string[] = []
    if (Array.isArray(livro.authors) && livro.authors.length > 0) {
      const nomes = await Promise.all(
        livro.authors.map(async (a) => {
          try {
            const rAutor = await fetch(`https://openlibrary.org${a.key}.json`, { signal: AbortSignal.timeout(5000) })
            if (!rAutor.ok) return null
            const dadosAutor = (await rAutor.json()) as { name?: string }
            return dadosAutor.name ?? null
          } catch {
            return null
          }
        })
      )
      autores = nomes.filter((n): n is string => !!n)
    }

    let anoPublicacao: number | undefined
    if (livro.publish_date) {
      const match = String(livro.publish_date).match(/\d{4}/)
      if (match) anoPublicacao = parseInt(match[0], 10)
    }

    if (!livro.title) return null

    return {
      titulo: livro.title,
      subtitulo: livro.subtitle,
      autores,
      editora: livro.publishers?.[0],
      anoPublicacao,
      numeroPaginas: livro.number_of_pages,
    }
  } catch {
    return null
  }
}
