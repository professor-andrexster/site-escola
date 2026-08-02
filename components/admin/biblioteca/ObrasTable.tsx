'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, BookOpen } from 'lucide-react'
import type { BibliotecaObra } from '@/types/database'

export type ObraLinha = BibliotecaObra & {
  autores: string[]
  categoriaNome: string | null
  totalExemplares: number
  exemplaresDisponiveis: number
}

interface ObrasTableProps {
  obras: ObraLinha[]
  categorias: { id: string; nome: string }[]
}

export default function ObrasTable({ obras, categorias }: ObrasTableProps) {
  const [busca, setBusca] = useState('')
  const [categoriaId, setCategoriaId] = useState('Todas')

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return obras.filter(o => {
      if (categoriaId !== 'Todas' && o.categoria_id !== categoriaId) return false
      if (termo) {
        const alvo = `${o.titulo} ${o.autores.join(' ')} ${o.isbn ?? ''}`.toLowerCase()
        if (!alvo.includes(termo)) return false
      }
      return true
    })
  }, [obras, categoriaId, busca])

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, autor ou ISBN..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          />
        </div>
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="border border-gray-200 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-escola-azul/30 bg-white"
        >
          <option value="Todas">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      {filtradas.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">
            {obras.length === 0 ? 'Nenhuma obra cadastrada ainda.' : 'Nenhuma obra encontrada com esses filtros.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
          {filtradas.map(o => (
            <Link
              key={o.id}
              href={`/admin/biblioteca/acervo/${o.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                {o.capa_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.capa_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-4 h-4 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{o.titulo}</p>
                <p className="text-xs text-gray-400 truncate">
                  {o.autores.length > 0 ? o.autores.join(', ') : 'Autor não informado'}
                  {o.categoriaNome && ` · ${o.categoriaNome}`}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className={`text-xs font-semibold ${o.exemplaresDisponiveis > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {o.exemplaresDisponiveis}/{o.totalExemplares} disponível
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
