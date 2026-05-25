import Image from 'next/image'
import Link from 'next/link'
import type { Noticia } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface NewsCardProps {
  noticia: Noticia
}

export default function NewsCard({ noticia }: NewsCardProps) {
  return (
    <Link
      href={`/noticias/${noticia.slug}`}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all flex flex-col"
    >
      <div className="relative w-full h-48 bg-gray-100 flex-shrink-0">
        {noticia.imagem_url ? (
          <Image
            src={noticia.imagem_url}
            alt={noticia.titulo}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-escola-azul-claro to-escola-verde-claro flex items-center justify-center">
            <span className="text-escola-azul text-4xl font-fraunces font-bold opacity-30">E</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <time className="text-gray-400 text-xs mb-2">{formatDate(noticia.created_at)}</time>
        <h3 className="font-fraunces text-gray-900 font-semibold text-base leading-snug line-clamp-2 mb-2 group-hover:text-escola-azul transition-colors">
          {noticia.titulo}
        </h3>
        {noticia.resumo && (
          <p className="text-gray-500 text-sm line-clamp-2 flex-1">{noticia.resumo}</p>
        )}
        <span className="text-escola-azul text-sm font-semibold mt-3 group-hover:underline">
          Leia mais →
        </span>
      </div>
    </Link>
  )
}
