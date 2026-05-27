import Image from 'next/image'
import Link from 'next/link'
import type { Noticia } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { badgeCategoria } from '@/lib/categorias'

interface NewsCardProps {
  noticia: Noticia
  featured?: boolean
}

export default function NewsCard({ noticia, featured = false }: NewsCardProps) {
  if (featured) {
    return (
      <Link
        href={`/noticias/${noticia.slug}`}
        className="group flex flex-col md:flex-row bg-white border border-escola-cinza-claro overflow-hidden card-lift"
      >
        <div className="relative w-full md:w-2/5 h-52 md:h-auto flex-shrink-0 bg-escola-creme-escuro">
          {noticia.imagem_url ? (
            <Image src={noticia.imagem_url} alt={noticia.titulo} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-escola-azul to-escola-azul-medio flex items-center justify-center">
              <span className="font-playfair text-6xl font-black text-white/20">JB</span>
            </div>
          )}
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-escola-vermelho" />
        </div>
        <div className="p-6 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const badge = badgeCategoria(noticia.categoria)
                return badge ? (
                  <span className={`tag border ${badge.bg} ${badge.text} ${badge.border}`}>{badge.label}</span>
                ) : (
                  <span className="tag tag-noticia">Notícia</span>
                )
              })()}
              <time className="font-mono text-xs text-escola-cinza">{formatDate(noticia.created_at)}</time>
            </div>
            <h3 className="font-playfair text-escola-azul font-bold text-xl md:text-2xl leading-tight mb-3 group-hover:text-escola-vermelho transition-colors line-clamp-3">
              {noticia.titulo}
            </h3>
            {noticia.resumo && (
              <p className="font-serif text-escola-cinza text-sm leading-relaxed line-clamp-3">{noticia.resumo}</p>
            )}
          </div>
          <span className="font-mono text-xs text-escola-vermelho font-medium mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Leia mais <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/noticias/${noticia.slug}`}
      className="group bg-white border border-escola-cinza-claro overflow-hidden card-lift flex flex-col"
    >
      <div className="relative w-full h-44 bg-escola-creme-escuro flex-shrink-0 overflow-hidden">
        {noticia.imagem_url ? (
          <Image src={noticia.imagem_url} alt={noticia.titulo} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-escola-azul to-escola-azul-medio flex items-center justify-center">
            <span className="font-playfair text-5xl font-black text-white/20">JB</span>
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-escola-vermelho" />
      </div>

      <div className="p-4 flex flex-col flex-1 border-t-0">
        <div className="flex items-center gap-2 mb-2">
          {(() => {
            const badge = badgeCategoria(noticia.categoria)
            return badge ? (
              <span className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>{badge.label}</span>
            ) : null
          })()}
          <time className="font-mono text-[11px] text-escola-cinza">{formatDate(noticia.created_at)}</time>
        </div>
        <h3 className="font-playfair text-escola-preto font-bold text-base leading-snug line-clamp-3 mb-2 group-hover:text-escola-vermelho transition-colors flex-1">
          {noticia.titulo}
        </h3>
        {noticia.resumo && (
          <p className="font-serif text-escola-cinza text-sm line-clamp-2 mb-3 leading-relaxed">{noticia.resumo}</p>
        )}
        <div className="pt-3 border-t border-escola-creme-escuro">
          <span className="font-mono text-[11px] text-escola-vermelho font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Leia mais <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
