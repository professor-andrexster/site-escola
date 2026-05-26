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
      <div className="relative w-full h-[480px] md:h-[580px] lg:h-[680px]">
        {noticia.imagem_url ? (
          <Image
            src={noticia.imagem_url}
            alt={noticia.titulo}
            fill
            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            priority
          />
        ) : (
          <Image
            src="/fachada.jpg"
            alt="E.E. Dr. João Beraldo"
            fill
            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            priority
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 img-overlay-dark" />

        {/* Decorative side line */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-escola-vermelho" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-14">
          <div className="max-w-4xl">
            {/* Label row */}
            <div className="flex items-center gap-3 mb-4">
              <span className="tag tag-destaque tracking-widest text-[10px]">
                ★ Destaque
              </span>
              <time className="font-mono text-xs text-white/60">
                {formatDate(noticia.created_at)}
              </time>
            </div>

            {/* Decorative rule */}
            <div className="w-16 h-0.5 bg-escola-vermelho mb-4" />

            {/* Title */}
            <h1 className="font-playfair text-white text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 text-balance drop-shadow-sm">
              {noticia.titulo}
            </h1>

            {noticia.resumo && (
              <p className="text-white/80 font-serif text-base md:text-lg line-clamp-2 mb-5 max-w-2xl leading-relaxed">
                {noticia.resumo}
              </p>
            )}

            <span className="inline-flex items-center gap-2 text-escola-creme font-mono text-sm font-medium group-hover:text-white transition-colors">
              Leia a reportagem completa
              <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
