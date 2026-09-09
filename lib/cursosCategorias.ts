export const CATEGORIAS_CURSO = ['Programação', 'Software', 'Hardware', 'Excel e Dados'] as const

export type CategoriaCurso = (typeof CATEGORIAS_CURSO)[number]

export const DESCRICAO_CATEGORIA: Record<CategoriaCurso, string> = {
  'Programação': 'Lógica, Python, Java, HTML/CSS, JavaScript, PHP, banco de dados e publicação de projetos.',
  'Software': 'Sistemas operacionais e cultura digital.',
  'Hardware': 'Peças, montagem, manutenção, diagnóstico e redes de computadores.',
  'Excel e Dados': 'Excel, Pacote Office e gestão do tempo.',
}

/**
 * A coluna `categoria` no banco é texto livre — sobrou de convenções
 * antigas (Web, Web Development, Sistemas, Network, Fundamentos,
 * Produtividade, Tecnologia) que nunca foram padronizadas depois da
 * migração para o MariaDB. Em vez de mexer nos dados de produção,
 * a tela agrupa por esta função, combinada com André: as 4 categorias
 * grandes onde o aluno entra pro curso.
 */
const MAPA_CATEGORIA_BRUTA: Record<string, CategoriaCurso> = {
  'Programação': 'Programação',
  'Web': 'Programação',
  'Web Development': 'Programação',
  'Banco de Dados': 'Programação',
  'Sistemas': 'Software',
  'Fundamentos': 'Software',
  'Hardware': 'Hardware',
  'Network': 'Hardware',
  'Produtividade': 'Excel e Dados',
  'Tecnologia': 'Excel e Dados',
}

export function categoriaGrande(categoriaBruta: string | null | undefined): CategoriaCurso | null {
  if (!categoriaBruta) return null
  return MAPA_CATEGORIA_BRUTA[categoriaBruta] ?? null
}
