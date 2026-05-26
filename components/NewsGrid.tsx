import Link from 'next/link'
import NewsCard from './NewsCard'
import type { Noticia } from '@/types/database'

interface NewsGridProps {
  noticias: Noticia[]
}

export default function NewsGrid({ noticias }: NewsGridProps) {
  const [primeira, ...restantes] = noticias

  if (noticias.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="border-t-4 border-escola-azul pt-6 mb-4">
          <div style={{ boxShadow: '0 2px 0 0 #c0392b' }} className="border-t border-escola-cinza-claro" />
        </div>
        <p className="font-serif text-escola-cinza text-center py-12">Nenhuma notícia recente para exibir.</p>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      {/* Section header newspaper style */}
      <div className="mb-8">
        <div className="border-t-4 border-escola-azul" style={{ boxShadow: '0 2px 0 0 #c0392b' }} />
        <div className="flex items-end justify-between mt-4">
          <div>
            <p className="section-label mb-1">Edição desta semana</p>
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul leading-none">
              Últimas Notícias
            </h2>
          </div>
          <Link
            href="/noticias"
            className="font-mono text-xs uppercase tracking-widest text-escola-vermelho hover:text-escola-azul transition-colors link-underline flex-shrink-0 mb-1"
          >
            Ver arquivo completo →
          </Link>
        </div>
      </div>

      {/* Featured first article */}
      {primeira && (
        <div className="mb-6">
          <NewsCard noticia={primeira} featured />
        </div>
      )}

      {/* Grid */}
      {restantes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restantes.map((noticia) => (
            <NewsCard key={noticia.id} noticia={noticia} />
          ))}
        </div>
      )}
    </section>
  )
}
