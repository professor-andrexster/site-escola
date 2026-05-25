import Link from 'next/link'
import NewsCard from './NewsCard'
import type { Noticia } from '@/types/database'

interface NewsGridProps {
  noticias: Noticia[]
}

export default function NewsGrid({ noticias }: NewsGridProps) {
  if (noticias.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12">
        <p className="text-gray-400 text-center">Nenhuma notícia recente para exibir.</p>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-fraunces text-2xl md:text-3xl font-bold text-gray-900">
          Últimas da Semana
        </h2>
        <Link
          href="/noticias"
          className="text-escola-azul text-sm font-semibold hover:underline flex-shrink-0"
        >
          Ver todas →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {noticias.map((noticia) => (
          <NewsCard key={noticia.id} noticia={noticia} />
        ))}
      </div>
    </section>
  )
}
