import Image from 'next/image'
import Link from 'next/link'
import type { Noticia } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface HeroBannerProps {
  noticia: Noticia
}

export default function HeroBanner({ noticia }: HeroBannerProps) {
  return (
    <Link href={`/noticias/${noticia.slug}`} className="block group relative overflow-hidden">
      <div className="relative w-full h-[420px] md:h-[520px] lg:h-[600px]">
        {noticia.imagem_url ? (
          <Image
            src={noticia.imagem_url}
            alt={noticia.titulo}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-escola-azul via-blue-700 to-escola-verde" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-14 max-w-4xl">
          <span className="inline-block bg-escola-azul text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            Destaque
          </span>
          <h1 className="font-fraunces text-white text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 drop-shadow-sm">
            {noticia.titulo}
          </h1>
          {noticia.resumo && (
            <p className="text-gray-200 text-base md:text-lg line-clamp-2 mb-4 max-w-2xl">
              {noticia.resumo}
            </p>
          )}
          <div className="flex items-center gap-4 text-gray-300 text-sm">
            <time>{formatDate(noticia.created_at)}</time>
            <span className="text-white font-semibold group-hover:underline">Leia mais →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
