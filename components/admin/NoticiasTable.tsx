'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { Noticia } from '@/types/database'
import { Pencil, Trash2, Eye, EyeOff, Star } from 'lucide-react'
import { badgeCategoria } from '@/lib/categorias'

interface NoticiasTableProps {
  noticias: Noticia[]
}

export default function NoticiasTable({ noticias: initial }: NoticiasTableProps) {
  const [noticias, setNoticias] = useState(initial)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function togglePublicado(id: string, current: boolean) {
    await supabase.from('noticias').update({ publicado: !current }).eq('id', id)
    setNoticias((prev) => prev.map((n) => n.id === id ? { ...n, publicado: !current } : n))
  }

  async function toggleDestaque(id: string, current: boolean) {
    if (!current) {
      await supabase.from('noticias').update({ destaque_home: false }).neq('id', id)
    }
    await supabase.from('noticias').update({ destaque_home: !current }).eq('id', id)
    setNoticias((prev) => prev.map((n) => ({
      ...n,
      destaque_home: n.id === id ? !current : (current ? false : n.destaque_home),
    })))
  }

  async function deleteNoticia(id: string) {
    if (!confirm('Tem certeza que deseja deletar esta notícia?')) return
    setDeletingId(id)
    await supabase.from('noticias').delete().eq('id', id)
    setNoticias((prev) => prev.filter((n) => n.id !== id))
    setDeletingId(null)
    router.refresh()
  }

  if (noticias.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
        Nenhuma notícia cadastrada ainda.{' '}
        <Link href="/admin/noticias/nova" className="text-escola-azul hover:underline">Criar primeira notícia</Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Título</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Categoria</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Data</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Publicado</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Destaque</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {noticias.map((noticia) => (
              <tr key={noticia.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 line-clamp-1">{noticia.titulo}</p>
                  <p className="text-gray-400 text-xs mt-0.5">/{noticia.slug}</p>
                  {noticia.autor_nome && (
                    <p className="text-gray-400 text-xs mt-0.5">por {noticia.autor_nome}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  {(() => {
                    const badge = badgeCategoria(noticia.categoria)
                    return badge ? (
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )
                  })()}
                </td>
                <td className="px-4 py-3 text-center text-gray-500 hidden md:table-cell">
                  {formatDate(noticia.created_at)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => togglePublicado(noticia.id, noticia.publicado)}
                    title={noticia.publicado ? 'Despublicar' : 'Publicar'}
                    className={`p-1.5 rounded-lg transition-colors ${noticia.publicado ? 'text-escola-verde bg-escola-verde-claro hover:bg-green-200' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {noticia.publicado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleDestaque(noticia.id, noticia.destaque_home)}
                    title={noticia.destaque_home ? 'Remover destaque' : 'Colocar em destaque'}
                    className={`p-1.5 rounded-lg transition-colors ${noticia.destaque_home ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <Star className={`w-4 h-4 ${noticia.destaque_home ? 'fill-yellow-500' : ''}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      href={`/admin/noticias/${noticia.id}`}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-escola-azul-claro hover:text-escola-azul transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteNoticia(noticia.id)}
                      disabled={deletingId === noticia.id}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
