import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import NewsCard from '@/components/NewsCard'
import { CATEGORIAS, type CategoriaKey } from '@/lib/categorias'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'JBInforma' }
export const revalidate = 60

const CATEGORIAS_VALIDAS = Object.keys(CATEGORIAS) as CategoriaKey[]

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const params = await searchParams
  const categoriaFiltro = CATEGORIAS_VALIDAS.includes(params.categoria as CategoriaKey)
    ? (params.categoria as CategoriaKey)
    : null

  const supabase = await createClient()
  let query = supabase
    .from('noticias')
    .select('*')
    .eq('publicado', true)
    .order('created_at', { ascending: false })

  if (categoriaFiltro) {
    query = query.eq('categoria', categoriaFiltro)
  }

  const { data: noticias } = await query

  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-escola-azul text-white py-12 border-b-2 border-escola-vermelho">
        <div className="container mx-auto px-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-escola-vermelho mb-2">
            Escola Estadual · Carlos Chagas, MG
          </p>
          <h1 className="font-playfair text-4xl md:text-5xl font-black">JBInforma</h1>
          <p className="text-white/60 mt-2 font-serif">Fique por dentro de tudo que acontece na escola</p>
        </div>
      </div>

      {/* Filtros de categoria */}
      <div className="bg-white border-b border-escola-cinza-claro sticky top-[104px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
            <Link
              href="/noticias"
              className={`flex-shrink-0 font-mono text-xs uppercase tracking-widest px-4 py-1.5 border transition-colors ${
                !categoriaFiltro
                  ? 'bg-escola-azul text-white border-escola-azul'
                  : 'bg-white text-escola-cinza border-escola-cinza-claro hover:border-escola-azul hover:text-escola-azul'
              }`}
            >
              Todas
            </Link>
            {CATEGORIAS_VALIDAS.map((key) => {
              const cat = CATEGORIAS[key]
              const ativo = categoriaFiltro === key
              return (
                <Link
                  key={key}
                  href={`/noticias?categoria=${key}`}
                  className={`flex-shrink-0 font-mono text-xs uppercase tracking-widest px-4 py-1.5 border transition-colors ${
                    ativo
                      ? `${cat.bg} ${cat.text} ${cat.border}`
                      : 'bg-white text-escola-cinza border-escola-cinza-claro hover:border-escola-azul hover:text-escola-azul'
                  }`}
                >
                  {cat.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lista de notícias */}
      <div className="container mx-auto px-4 py-12">
        {noticias && noticias.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.map((noticia) => (
              <NewsCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-serif text-escola-cinza text-lg">
              {categoriaFiltro
                ? `Nenhuma notícia em ${CATEGORIAS[categoriaFiltro].label} ainda.`
                : 'Nenhuma notícia publicada ainda.'}
            </p>
            {categoriaFiltro && (
              <Link href="/noticias" className="font-mono text-xs uppercase tracking-widest text-escola-vermelho hover:text-escola-azul transition-colors mt-4 inline-block">
                Ver todas as notícias →
              </Link>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
