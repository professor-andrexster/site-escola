export const CATEGORIAS = {
  tecnologia: { label: 'Tecnologia', bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200'   },
  esporte:    { label: 'Esporte',    bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200'  },
  projeto:    { label: 'Projeto',    bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-200'  },
  cidadania:  { label: 'Cidadania', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
} as const

export type CategoriaKey = keyof typeof CATEGORIAS

export function badgeCategoria(categoria: string | null) {
  if (!categoria || !(categoria in CATEGORIAS)) return null
  return CATEGORIAS[categoria as CategoriaKey]
}
