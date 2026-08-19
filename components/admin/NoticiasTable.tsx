'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { Noticia, Profile } from '@/types/database'
import { Pencil, Trash2, Eye, EyeOff, Star } from 'lucide-react'
import { badgeCategoria } from '@/lib/categorias'
import { isGestao } from '@/lib/roles'

interface NoticiasTableProps {
  noticias: Noticia[]
  canSetDestaque?: boolean
  role?: Profile['role']
}

export default function NoticiasTable({
  noticias: initial,
  canSetDestaque = true,
  role = 'diretora',
}: NoticiasTableProps) {
  const [noticias, setNoticias] = useState(initial)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const [erro, setErro] = useState('')
  const canDelete = isGestao(role)

  // O log de quem mexeu no que e escrito pelo servidor, a partir da sessao.
  // Antes vinha daqui, com a acao e o nome do autor escolhidos pelo navegador.
  async function pedir(id: string, init: RequestInit) {
    setErro('')
    const res = await fetch(`/api/noticias/${id}`, init)
    if (res.ok) return true
    setErro((await res.json().catch(() => ({}))).error ?? 'Não foi possível concluir a ação.')
    return false
  }

  async function togglePublicado(id: string, _titulo: string, current: boolean) {
    const ok = await pedir(id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicado: !current }),
    })
    if (ok) setNoticias((prev) => prev.map((n) => n.id === id ? { ...n, publicado: !current } : n))
  }

  async function toggleDestaque(id: string, _titulo: string, current: boolean) {
    const ok = await pedir(id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destaque_home: !current }),
    })
    if (ok) {
      setNoticias((prev) => prev.map((n) => ({
        ...n,
        destaque_home: n.id === id ? !current : (current ? false : n.destaque_home),
      })))
    }
  }

  async function deleteNoticia(id: string, _titulo: string) {
    if (!confirm('Tem certeza que deseja deletar esta notícia?')) return
    setDeletingId(id)
    const ok = await pedir(id, { method: 'DELETE' })
    if (ok) {
      setNoticias((prev) => prev.filter((n) => n.id !== id))
      router.refresh()
    }
    setDeletingId(null)
  }

  if (noticias.length === 0) {
    return (
      <div className="panel p-12 text-center text-gray-500">
        Nenhuma notícia cadastrada ainda.{' '}
        <Link href="/admin/noticias/nova" className="text-escola-azul hover:underline">Criar primeira notícia</Link>
      </div>
    )
  }

  return (
    <div className="panel overflow-hidden">
      {erro && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-3 text-sm">
          {erro}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Título</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Categoria</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Data</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Publicado</th>
              {canSetDestaque && <th className="text-center px-4 py-3 font-semibold text-gray-700">Destaque</th>}
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {noticias.map((noticia) => (
              <tr key={noticia.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 line-clamp-1">{noticia.titulo}</p>
                  <p className="text-gray-500 text-xs mt-0.5">/{noticia.slug}</p>
                  {noticia.autor_nome && (
                    <p className="text-gray-500 text-xs mt-0.5">por {noticia.autor_nome}</p>
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
                    onClick={() => togglePublicado(noticia.id, noticia.titulo, noticia.publicado)}
                    title={noticia.publicado ? 'Tirar do ar' : 'Publicar'}
                    className={`p-1.5 rounded-lg transition-colors ${noticia.publicado ? 'text-escola-verde bg-escola-verde-claro hover:bg-green-200' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {noticia.publicado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </td>
                {canSetDestaque && (
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleDestaque(noticia.id, noticia.titulo, noticia.destaque_home)}
                      title={noticia.destaque_home ? 'Remover destaque' : 'Colocar em destaque'}
                      className={`p-1.5 rounded-lg transition-colors ${noticia.destaque_home ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <Star className={`w-4 h-4 ${noticia.destaque_home ? 'fill-yellow-500' : ''}`} />
                    </button>
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      href={`/admin/noticias/${noticia.id}`}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-escola-azul-claro hover:text-escola-azul transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    {canDelete && (
                      <button
                        onClick={() => deleteNoticia(noticia.id, noticia.titulo)}
                        disabled={deletingId === noticia.id}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
